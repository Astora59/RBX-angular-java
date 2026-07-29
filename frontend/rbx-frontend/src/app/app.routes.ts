import { Routes } from '@angular/router';
import { RouterModule } from '@angular/router';
import { Home } from './pages/home/home';
import { Game } from './pages/game/game';
import { NotFound } from './pages/not-found/not-found';


export const routes: Routes = [

    {
        path: '',
        component: Home
    },
    {
        path: 'game',
        component: Game
    },
    {
        path: '**',
        component: NotFound
    }
];
