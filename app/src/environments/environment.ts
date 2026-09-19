// src/environments/environment.ts

import { environmentLocal } from './environment.local';

export const environment = {
  production: true,

  supabaseUrl: 'https://qokfqizsxpmkmdrdgbjy.supabase.co',
  supabasePublishableKey: 'sb_publishable_8-GiF6-c6RtSGNZoup5JCw_N31_4VF6',

  // Read from the local .env file (gitignored) — see .env.example and
  // scripts/generate-env.js. Requires the "Places API (New)" enabled on the
  // key, restricted to this site's origin(s) in the Google Cloud Console.
  googleMapsApiKey: environmentLocal.googleMapsApiKey
};