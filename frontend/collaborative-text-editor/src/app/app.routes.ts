import { ResolveFn, Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard.component';
import { Editor } from './components/editor/editor.component';

const documentTitle: ResolveFn<string> = (route) => route.queryParams['id'];

export const routes: Routes = [{
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
},
{
    path: 'dashboard',
    component: Dashboard,
    title: 'Dashboard'    
},
{
    path: 'document/:id',
    component: Editor,
    title: 'Document'
}];
