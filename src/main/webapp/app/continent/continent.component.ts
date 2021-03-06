import { Component, OnInit, ViewChild } from '@angular/core';
import { AccountService } from 'app/core';
import { ContinentService } from './continent.service';
import { mergeMap, flatMap, concatMap, map, debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { Observable, Subject, merge, iif } from 'rxjs';
import { Router } from '@angular/router';

@Component({
    selector: 'jhi-continent',
    templateUrl: './continent.component.html',
    styleUrls: ['continent.scss']
})
export class ContinentComponent implements OnInit {
    currentAccount: any;
    continents: any[];
    model: any;
    search: any;
    formatter: any;

    constructor(protected accountService: AccountService, protected continentService: ContinentService, protected router: Router) {}

    ngOnInit() {
        this.accountService.identity().then(account => {
            this.currentAccount = account;
        });
        this.continentService.getContinents().subscribe((responses: any[]) => {
            this.continents = responses;
        });

        this.search = (text$: Observable<string>) =>
            text$.pipe(
                debounceTime(200),
                distinctUntilChanged(),
                map(term =>
                    term === '' ? [] : this.continents.filter(v => v.name.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10)
                )
            );
        this.formatter = (x: { name: string }) => x.name;
    }

    searchContinent() {
        if (this.model === '' || this.continents.filter(continent => continent.name === this.model.name).length <= 0) {
            this.continentService.getContinents().subscribe((responses: any[]) => (this.continents = responses));
        } else {
            this.continentService
                .getContinents()
                .pipe(
                    map((continents: any[]) => {
                        return continents.filter(continent => continent.name === this.model.name);
                    })
                )
                .subscribe((responses: any[]) => (this.continents = responses));
            this.router.navigate(['/continent/' + this.model.name + '/view']);
        }
    }
}
