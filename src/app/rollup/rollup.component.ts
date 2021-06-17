import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'rollup',
  templateUrl: './rollup.component.html',
  styleUrls: ['./rollup.component.scss']
})
export class RollUpComponent implements OnInit{
  public responseText: string;
  public countries: any[];
  public regions: any[];

  public srRollUp: number;
  public rrRollUp: number;
  public srRegionRollUp: number;
  public rrRegionRollUp: number;
  public srWWRollUp: number;
  public rrWWRollUp: number;

  ngOnInit(): void {
    this.responseText = "";
    this.countries = [];
    this.regions = [];
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
      }
    });

    const regionNames = [];
    response.serviceResponse.studyPlanDetails.regionList.geography.forEach(reg => {
      if(reg.cohortKey == undefined && reg.geographyLevel == "Region") {
        if(!regionNames.includes(reg.geographyName)) {
          let curRegion = {
            key: reg.geographyKey,
            name: reg.geographyName
          }
          this.regions.push(curRegion);
        }
        regionNames.push(reg.geographyName);
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
        srNumerator += srCalc;
      }
      if(coh.rr && coh.cycleTime && coh.activeSites) {
        const rrCalc: any = (parseFloat(coh.rr) * parseFloat(coh.cycleTime) * parseFloat(coh.activeSites));
        rrNumerator += rrCalc;
      }
      
    });

    let denominator = countryActiveSites * countryCycleTime;
    console.log(`Denominator ${denominator}`);


    this.srRollUp = srNumerator / denominator;
    this.rrRollUp = rrNumerator / denominator
    console.log(`SR ROLLUP: ${this.srRollUp}, RR ROLLUP: ${this.rrRollUp}`);
  }


  regionSelected($event) {
    let regionCycleTime;
    let regionActiveSites;

    const selectedRegion = $event.value;
    console.log(selectedRegion);

    const response = JSON.parse(this.responseText);

    let regionVisited = false;
    response.serviceResponse.studyPlanDetails.regionList.geography.forEach(reg => {
      if(!regionVisited){
        if(reg.geographyName == selectedRegion.name && reg.cohortKey == undefined) {
          regionVisited = true;
          const regionName = reg.geographyName;
          const regionARC = reg.planParamsDetails.ARC;
          const regionSites = reg.planParamsDetails.numSites;
          const regionFSI = reg.planParamsDetails.FSI;
          const regionPLSR = reg.planParamsDetails.PLSR;

          regionCycleTime = this.daysBetween(new Date(regionPLSR) , new Date(regionFSI)) + 1;
          regionActiveSites = Math.floor(regionSites * (regionARC / 100));
        }
      }
    });


    const cohortInfo = [];
    response.serviceResponse.studyPlanDetails.regionList.geography.forEach(geo => {
      if(geo.geographyName == selectedRegion.name && geo.cohortKey) {
        const cohortFSI = geo.planParamsDetails.PFSI;
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
        srNumerator += srCalc;
      }
      if(coh.rr && coh.cycleTime && coh.activeSites) {
        const rrCalc: any = (parseFloat(coh.rr) * parseFloat(coh.cycleTime) * parseFloat(coh.activeSites));
        rrNumerator += rrCalc;
      }
      console.log(`SR-Numerator ${srNumerator}, RR-Numerator ${rrNumerator}`);  
    });

    let denominator = regionActiveSites * regionCycleTime;
    console.log(`Denominator ${denominator}`);


    this.srRegionRollUp = srNumerator / denominator;
    this.rrRegionRollUp = rrNumerator / denominator
    console.log(`SR Region ROLLUP: ${this.srRegionRollUp}, RR Region ROLLUP: ${this.rrRegionRollUp}`);
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
