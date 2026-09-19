import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';
import { ParsedAddress } from '../../pages/profile/types';

declare global {
  interface Window {
    google?: typeof google;
  }
}

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsService {

  private loadingPromise: Promise<void> | null = null;

  constructor(@Inject(PLATFORM_ID) private readonly platformId: object) {}

  private loadScript(): Promise<void> {

    if (!isPlatformBrowser(this.platformId)) {
      return Promise.reject(new Error('Google Maps can only be loaded in the browser.'));
    }

    if (!environment.googleMapsApiKey) {
      return Promise.reject(new Error('Google Maps API key is not configured.'));
    }

    if (window.google?.maps?.places) {
      return Promise.resolve();
    }

    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');

      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=places&loading=async&callback=__onGoogleMapsLoaded`;
      script.async = true;

      (window as any).__onGoogleMapsLoaded = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Maps.'));

      document.head.appendChild(script);
    });

    return this.loadingPromise;
  }

  /**
   * Mounts a Google Places autocomplete input into `container` and invokes
   * `onPlaceSelected` with the parsed address whenever the user picks a real,
   * Google-verified place from the suggestions dropdown.
   */
  async attachAutocomplete(
    container: HTMLElement,
    onPlaceSelected: (address: ParsedAddress) => void
  ): Promise<google.maps.places.PlaceAutocompleteElement> {

    await this.loadScript();

    const element = new google.maps.places.PlaceAutocompleteElement();

    container.appendChild(element);

    element.addEventListener('gmp-select', async (event) => {
      const place = event.placePrediction.toPlace();

      await place.fetchFields({ fields: ['addressComponents', 'formattedAddress'] });

      const parsed = this.parseAddressComponents(
        place.addressComponents ?? [],
        place.formattedAddress ?? ''
      );

      if (parsed) {
        onPlaceSelected(parsed);
      }
    });

    return element;
  }

  private parseAddressComponents(
    components: google.maps.places.AddressComponent[],
    formattedAddress: string
  ): ParsedAddress | null {

    const get = (type: string) =>
      components.find((component) => component.types.includes(type))?.longText ?? '';

    const streetNumber = get('street_number');
    const route = get('route');
    const city = get('locality') || get('postal_town') || get('sublocality') || '';
    const zipcode = get('postal_code');
    const country = get('country');
    const address = [streetNumber, route].filter(Boolean).join(' ');

    if (!address && !city && !country) {
      return null;
    }

    return { address, zipcode, city, country, formattedAddress };
  }
}
