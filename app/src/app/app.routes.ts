import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		loadComponent: () => import('./pages/home/home').then((m) => m.HomePage),
	},
	{
		path: 'restaurants',
		loadComponent: () => import('./pages/restaurants/restaurants').then((m) => m.RestaurantsPage),
	},
	{
		path: 'profile',
		loadComponent: () => import('./pages/profile/profile').then((m) => m.ProfilePage),
	},
	{
		path: '**',
		redirectTo: '',
	},
];
