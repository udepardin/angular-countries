import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ICountry } from './continent.model';
import { Country } from './continent.model';
import { ContinentService } from './continent.service';
import { LocalStorageService, SessionStorageService } from 'ngx-webstorage';
import { ITEMS_PER_PAGE } from 'app/shared';
import { mergeMap, flatMap, concatMap, map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { counter } from '@fortawesome/fontawesome-svg-core';

const COUNTRY_SEARCH = 'SearchKey';

@Component({
    selector: 'jhi-continent-country',
    templateUrl: './continent-country.component.html',
    styleUrls: ['continent.scss']
})
export class ContinentCountryComponent implements OnInit {
    countries: ICountry[];
    ContinentName: string;
    country: Country;
    SearchKey: string;
    model: any;
    search: any;
    formatter: any;

    constructor(
        protected activatedRoute: ActivatedRoute,
        protected continentService: ContinentService,
        protected localStorageService: LocalStorageService,
        protected router: Router
    ) {}

    ngOnInit() {
        this.ContinentName = this.activatedRoute.snapshot.params['continentname'];
        // cek local storage isi dari inputan search
        if (this.localStorageService.retrieve(COUNTRY_SEARCH) !== null) {
            // kl ada simpen di vAriable SearchKey
            this.SearchKey = this.localStorageService.retrieve(COUNTRY_SEARCH);
            // setelah disimpan load search(SearchKey)
            this.searchCountry();
        } else {
            // kl kosong tidak ada isi load semua data
            this.continentService.getCountries(this.ContinentName).subscribe((responses: any[]) => (this.countries = responses));
        }
        this.search = (text$: Observable<string>) =>
            text$.pipe(
                debounceTime(200),
                distinctUntilChanged(),
                map(term =>
                    term === '' ? [] : this.countries.filter(v => v.name.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10)
                )
            );
        this.formatter = (x: { name: string }) => x.name;
    }

    previousState() {
        window.history.back();
    }

    searchCountry() {
        this.continentService
            .getCountryByName(this.SearchKey)
            .pipe(
                map((countries: any[]) => {
                    return countries.filter(country => country.region === this.ContinentName);
                })
            )
            .subscribe((response: any) => {
                this.countries = response;
            });
        this.localStorageService.store(COUNTRY_SEARCH, this.SearchKey);
    }

    searchCountryTypeahead() {
        if (this.model === '') {
            this.continentService.getCountries(this.ContinentName).subscribe((responses: any[]) => (this.countries = responses));
        } else {
            this.continentService
                .getCountryByName(this.model.name)
                .pipe(
                    map((countries: any[]) => {
                        countries.map(country => {
                            return this.router.navigate(['/continent/' + this.ContinentName + '/' + country.alpha3Code + '/view']);
                        });
                        return countries;
                    })
                )
                .subscribe((response: any) => {
                    this.countries = response;
                });
        }
    }

    clear() {
        this.SearchKey = '';
        this.localStorageService.clear(COUNTRY_SEARCH);
        this.continentService.getCountries(this.ContinentName).subscribe((responses: any[]) => (this.countries = responses));
    }
}
