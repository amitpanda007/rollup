import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'rollup',
  templateUrl: './rollup.component.html',
  styleUrls: ['./rollup.component.scss']
})
export class RollUpComponent implements OnInit{

  public responseText: string;
  public countries: any[];
  public srRollUp: number;
  public rrRollUp: number;

  ngOnInit(): void {
    this.responseText = "";
    this.countries = [];
  }

  constructor() {}

  setData() {
    const response = JSON.parse(this.responseText);
    console.log(response);

    response.serviceResponse.studyPlanDetails.geoList.geography.forEach(geo => {
      if(geo.geographyLevel == "Country" && geo.isCohortCountry == false) {
        let curCountry = {
          key: geo.geographyKey,
          name: geo.geographyName
        }
        this.countries.push(curCountry);
        
        // const countryName = geo.geographyName;
        // const countryARC = geo.planParamsDetails.ARC;
        // const countrySites = geo.planParamsDetails.numSites;
        // const countryFSI = geo.planParamsDetails.FSI;
        // const countryPLSR = geo.planParamsDetails.PLSR;
      }
    });
  }

  countrySelected($event) {
    let countryCycleTime;
    let countryActiveSites;


    const selectedCountry = $event.value;
    console.log(selectedCountry);

    const response = JSON.parse(this.responseText);

    response.serviceResponse.studyPlanDetails.geoList.geography.forEach(geo => {
      if(geo.geographyName == selectedCountry.name && geo.isCohortCountry == false) {
        const countryName = geo.geographyName;
        const countryARC = geo.planParamsDetails.ARC;
        const countrySites = geo.planParamsDetails.numSites;
        const countryFSI = geo.planParamsDetails.FSI;
        const countryPLSR = geo.planParamsDetails.PLSR;

        countryCycleTime = this.daysBetween(new Date(countryPLSR) , new Date(countryFSI)) + 1;
        countryActiveSites = Math.floor(countrySites * (countryARC / 100));
      }
    });


    const cohortInfo = [];
    response.serviceResponse.studyPlanDetails.geoList.geography.forEach(geo => {
      if(geo.geographyName == selectedCountry.name && geo.isCohortCountry == true) {
        const cohortFSI = geo.planParamsDetails.FSI;
        const cohortLSR = geo.planParamsDetails.PLSR;
        const cohortSites = geo.planParamsDetails.numSites;
        const cohortARC = geo.planParamsDetails.ARC;
        const cohortSR = geo.planParamsDetails.SR;
        const cohortRR = geo.planParamsDetails.RR;

        const cohortCycleTime = this.daysBetween(new Date(cohortLSR) , new Date(cohortFSI)) + 1;
        const cohortActiveSite = Math.floor(cohortSites * (cohortARC / 100));

        const coh = {
          name: geo.cohortName,
          cycleTime: cohortCycleTime,
          sr: cohortSR,
          rr: cohortRR,
          activeSites: cohortActiveSite
        }
        cohortInfo.push(coh);
      }
    });

    //Calculate Final
    let srNumerator = 0;
    let rrNumerator = 0;
    cohortInfo.forEach(coh => {
      console.log(coh);
      if(coh.sr && coh.cycleTime && coh.activeSites) {
        const srCalc: any = (parseFloat(coh.sr) * parseFloat(coh.cycleTime) * parseFloat(coh.activeSites));
        const rrCalc: any = (parseFloat(coh.rr) * parseFloat(coh.cycleTime) * parseFloat(coh.activeSites));
        srNumerator += srCalc;
        rrNumerator += rrCalc;
      }
      
    });

    let denominator = countryActiveSites * countryCycleTime;
    console.log(`Denominator ${denominator}`);


    this.srRollUp = srNumerator / denominator;
    this.rrRollUp = rrNumerator / denominator
    console.log(`SR ROLLUP: ${this.srRollUp}, RR ROLLUP: ${this.rrRollUp}`);
  }


  daysBetween(date1: any, date2: any) {
    // The number of milliseconds in one day
    const ONE_DAY = 1000 * 60 * 60 * 24;
    // Calculate the difference in milliseconds
    const differenceMs = Math.abs(date1 - date2);
    // Convert back to days and return
    return Math.round(differenceMs / ONE_DAY);

}

  
}
