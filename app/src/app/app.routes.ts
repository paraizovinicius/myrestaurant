import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		loadComponent: () => import('./pages/home/home').then((m) => m.HomePage),
	},
	{
		path: 'feed',
		loadComponent: () => import('./pages/feed/feed').then((m) => m.FeedPage),
	},
	{
		path: 'restaurants',
		loadComponent: () => import('./pages/restaurants/restaurants').then((m) => m.RestaurantsPage),
	},
	{
		path: 'restaurants/:id',
		loadComponent: () => import('./pages/restaurant-details/restaurant-details').then((m) => m.RestaurantDetailsPage),
	},
	{
		path: 'review/:id',
		loadComponent: () => import('./pages/review-details/review-details').then((m) => m.ReviewDetailsPage),
	},
	{
		path: 'profile',
		loadComponent: () => import('./pages/profile/profile').then((m) => m.ProfilePage),
	},
	{
		path: 'user/:id',
		loadComponent: () => import('./pages/user-profile/user-profile').then((m) => m.UserProfilePage),
	},
	{
		path: 'login',
		loadComponent: () => import('./pages/login/login').then((m) => m.LoginPage),
	},
	{
		path: 'signup',
		loadComponent: () => import('./pages/signup/signup').then((m) => m.SignupPage),
	},
	{
	path: 'auth/update-password',
	loadComponent: () =>
		import('./pages/auth/update-password/update-password')
		.then(m => m.UpdatePasswordPage)
	},
	{
		path: '**',
		redirectTo: '',
	},
];
