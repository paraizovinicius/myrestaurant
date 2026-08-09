import json


INPUT_FILE = "export.geojson"
OUTPUT_FILE = "restaurants.sql"

COUNTRY = "Brazil"
CITY = "Rio de Janeiro"


def sql_string(value):
    """
    Convert a Python value into a SQL-safe string or NULL.
    """
    if value is None:
        return "NULL"

    value = str(value).strip()

    if not value:
        return "NULL"

    # Escape single quotes for PostgreSQL
    value = value.replace("'", "''")

    return f"'{value}'"


def get_first(properties, *keys):
    """
    Return the first non-empty value from the given keys.
    """
    for key in keys:
        value = properties.get(key)

        if value is not None and str(value).strip():
            return value

    return None

def normalize_phone(value):
    if not value:
        return None

    value = str(value).strip()

    # If there are multiple phones separated by ";",
    # keep only the first one.
    if ";" in value:
        value = value.split(";")[0].strip()

    # If there are more than 4 space-separated parts,
    # keep only the first 4.
    #
    # Example:
    # +55 21 98444 5918 22685918
    # becomes:
    # +55 21 98444 5918
    parts = value.split()

    if len(parts) > 4:
        value = " ".join(parts[:4])

    # Maximum 19 characters.
    # Anything after character 19 is ignored.
    #
    # Example:
    # +55 (21) 98444-5918 22...
    # becomes:
    # +55 (21) 98444-5918
    if len(value) > 19:
        value = value[:19]

    return value

def normalize_website(value):
    if not value:
        return None

    value = str(value).strip()

    value_lower = value.lower()

    if (
        "http" not in value_lower
        and "www" not in value_lower
        and ".com" not in value_lower
        and ".br" not in value_lower
    ):
        return None

    return value

with open(INPUT_FILE, "r", encoding="utf-8") as f:
    geojson = json.load(f)


sql_statements = []

sql_statements.append(f"""
INSERT INTO public.restaurants (
    name,
    description,
    address_line1,
    city,
    postal_code,
    country,
    latitude,
    longitude,
    phone,
    website_url
)
VALUES
""")

for feature in geojson.get("features", []):

    properties = feature.get("properties", {})
    geometry = feature.get("geometry", {})

    # -------------------------
    # Name
    # -------------------------

    name = properties.get("name")

    # Skip objects without a restaurant name
    if not name:
        continue

    # -------------------------
    # Description
    # -------------------------

    description = get_first(
        properties,
        "description"
    )

    # -------------------------
    # Address
    # -------------------------

    street = properties.get("addr:street")
    housenumber = properties.get("addr:housenumber")

    if street and housenumber:
        address_line1 = f"{street}, {housenumber}"
    elif street:
        address_line1 = street
    elif housenumber:
        address_line1 = housenumber
    else:
        address_line1 = None

    # -------------------------
    # Postal code
    # -------------------------

    postal_code = get_first(
        properties,
        "addr:postcode"
    )

    # -------------------------
    # Phone
    # -------------------------

    # we need to filter it:
    # if it contains ";", ignore what's next
    # if there are more than 4 " " (spaces), ignore what's next
    phone = normalize_phone(
        get_first(
            properties,
            "phone",
            "contact:phone"
        )
    )

    # -------------------------
    # Website
    # -------------------------

    # we need to filter: If it does not contain 'http', 'www', '.com', '.br', it must be NULL
    website = normalize_website(
        get_first(
            properties,
            "website",
            "contact:website"
        )
    )

    # -------------------------
    # Coordinates
    # -------------------------

    coordinates = geometry.get("coordinates")

    latitude = None
    longitude = None

    if (
        isinstance(coordinates, list)
        and len(coordinates) >= 2
    ):
        longitude = coordinates[0]
        latitude = coordinates[1]

    # -------------------------
    # Build SQL
    # -------------------------

    sql = f"""(
    {sql_string(name)},
    {sql_string(description)},
    {sql_string(address_line1)},
    {sql_string(CITY)},
    {sql_string(postal_code)},
    {sql_string(COUNTRY)},
    {latitude if latitude is not None else "NULL"},
    {longitude if longitude is not None else "NULL"},
    {sql_string(phone)},
    {sql_string(website)}
    ),"""

    sql_statements.append(sql)


# Write SQL file
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    f.write("\n\n".join(sql_statements))


print(f"Processed {len(sql_statements)} restaurants.")
print(f"SQL written to: {OUTPUT_FILE}")