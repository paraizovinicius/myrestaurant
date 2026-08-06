import { Injectable } from '@angular/core';
import { supabase } from '../supabase/supabase.client';

@Injectable({
  providedIn: 'root'
})
export class PopularRestaurantsService {

// TODO
//doing aggregation in Angular becomes inefficient.
// Eventually move this logic to PostgreSQL
  async getPopularRestaurants(limit: number = 5) {

    const dayIntervals = [7, 14, 30, 90, 365]; // Escalating time windows in days
    let data: any[] = [];

    for (const days of dayIntervals) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data: result, error } = await supabase
        .from('reviews')
        .select(`
            id,
            rating,
            created_at,
            restaurants!reviews_restaurant_id_fkey(
            id,
            name,
            city
            )
        `)
        .gte('created_at', startDate.toISOString());

        if (error) {
        throw error;
        }

        if (result && result.length >= limit) {
        data = result;
        break; // Found enough records, stop expanding
        }

        // Keep the best attempt so far in case even 365 days yields fewer than `targetLimit`
        data = result ?? [];
    }

    // Fallback: If still under targetLimit, query without any date restriction
    if (data.length < limit) {
        const { data: fallbackData, error: fallbackError } = await supabase
        .from('reviews')
        .select(`
            id,
            rating,
            created_at,
            restaurants!reviews_restaurant_id_fkey(
            id,
            name,
            city
            )
        `)
        .limit(limit);

        if (fallbackError) {
        throw fallbackError;
        }

        data = fallbackData ?? [];
    }



    // Group reviews by restaurant
    const restaurants = new Map();

    for (const review of data) {
      // Safely extract the restaurant object whether it arrives as an array or a single object
      const rawRestaurant = review.restaurants;
      const restaurant = Array.isArray(rawRestaurant) ? rawRestaurant[0] : rawRestaurant;

      // Guard against missing/null restaurant data
      if (!restaurant?.id) {
          continue;
      }

      if (!restaurants.has(restaurant.id)) {
          restaurants.set(restaurant.id, {
          id: restaurant.id,
          name: restaurant.name,
          city: restaurant.city,
          ratings: [],
          reviewCount: 0,
          });
      }

      const item = restaurants.get(restaurant.id);

      item.ratings.push(review.rating);
      item.reviewCount++;
    }



    const trending = Array.from(
      restaurants.values()
    )
    .map(restaurant => {

      const average =
        restaurant.ratings.reduce(
          (a: number, b: number) => a + b,
          0
        )
        /
        restaurant.ratings.length;


      return {
        ...restaurant,

        averageRating:
          Number(average.toFixed(1)),

        trendingScore:
          average * Math.log(
            restaurant.reviewCount + 1
          )
      };

    })
    .sort(
      (a,b) =>
        b.trendingScore -
        a.trendingScore
    )
    .slice(0, limit);



    return trending;
  }
}

// CREATE VIEW trending_restaurants AS
// SELECT
//     r.id,
//     r.name,
//     AVG(rev.rating) average_rating,
//     COUNT(rev.id) review_count
// FROM restaurants r
// JOIN reviews rev
// ON rev.restaurant_id = r.id
// WHERE rev.created_at > now() - interval '7 days'
// GROUP BY r.id;