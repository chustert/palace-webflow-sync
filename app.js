const axios = require('axios');
const Webflow = require('webflow-api');
// const parseString = require('xml2js').parseString;
const diff = require('arr-diff');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const findDuplicates = require('array-find-duplicates');
// const { response } = require('express');
const { Console } = require("console");
const fs = require("fs");

const consoleLogger = new Console({
    stdout: fs.createWriteStream("normalStdout.txt"),
    stderr: fs.createWriteStream("errStdErr.txt"),
  });

const nodemailer = require('nodemailer');
let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: "christianhustert@gmail.com",
            pass: "xtxqhnpwyswcfjct"
        }
})

let mailOptions = {
    from: "christianhustert@gmail.com",
    to: "christianhustert@gmail.com",
    subject: "Nodemailer Test",
    text: "Hello SMTP Email!",
    attachments: [
        {   // filename and content type is derived from path
            path: 'normalStdout.txt'
        },
        {
            path: 'errStdErr.txt'
        }
     ]
}

const modules = require('./modules/modules');

const api_key = process.env.API_KEY;
const palaceEmail = process.env.PALACE_LOGIN;
const palacePass = process.env.PALACE_PASSWORD;
const site_id = process.env.SITE_ID;
const webflow_domain = process.env.WEBFLOW_DOMAIN;
//let collections_id = process.env.COLLECTION_ID;

const propertiesCollection = process.env.PROPERTIES_COLLECTION_ID;
const regionsCollection = process.env.REGIONS_COLLECTION_ID;
const districtsCollection = process.env.DISTRICTS_COLLECTION_ID;
const suburbsCollection = process.env.SUBURBS_COLLECTION_ID;

let itemCodetoDelete, listOfItems, itemToDelete, duplicateItem, itemsToDelete, name, propertyaddress1, propertyaddress2, propertyaddress3, propertyaddress4, propertycode, propertydateavailableNew, propertydateavailableIsoDate;

let uniqueWebflowListingsCollectionsArray = [];
let uniqueWebflowRegionsCollectionsArray = [];
let uniqueWebflowDistrictsCollectionsArray = [];
let uniqueWebflowSuburbsCollectionsArray = [];

let uniqueWebflowPropertyCodesArray = [];
let uniqueWebflowRegionNamesArray = [];
let uniqueWebflowDistrictNamesArray = [];
let uniqueWebflowSuburbCodesArray = [];

let uniquePalacePropertyCodesArray = [];
let uniquePalaceRegionNamesArray = [];
let uniquePalaceDistrictNamesArray = [];
let uniquePalaceSuburbCodesArray = [];

let propertyLoopCounter = 0;
let regionLoopCounter = 0;
let districtLoopCounter = 0;
let suburbLoopCounter = 0;

const webflow = new Webflow({
    token: api_key
});

async function getPalaceListings() {
    try {
        const response = await connectToAvailablePalaceProperties();
        const properties = response.data;
        
        const headerDate = response.headers && response.headers.date ? response.headers.date : 'no response date';
        consoleLogger.log(' ');
        consoleLogger.log(' ');
        consoleLogger.log('****************************');
        consoleLogger.log('Status Code:', response.status);
        consoleLogger.log('Date in Response header:', headerDate);
        consoleLogger.log('****************************');
        consoleLogger.log(' ');
        consoleLogger.log(`Properties.Length: ${properties.length}`);
        

        for (const property of properties) {
            uniquePalacePropertyCodesArray.push(property.PropertyCode); // NOTE: This needs to be outside of this for loop as it doubles everything up. Should be in its own foor loop, going through it only once!
        }
        consoleLogger.log(`Palace Property Codes: ${uniquePalacePropertyCodesArray}`);
        consoleLogger.log(' ');

        const webflowCollections = await pullWebflowCollections();
        const uniqueWebflowListingsCollectionsArray = await createUniqueWebflowListingsCollectionsArray(webflowCollections);
        await loopListingsCollectionsAndPullItems(uniqueWebflowListingsCollectionsArray);

        // const webflowItems = await pullWebflowItems(propertiesCollection);
        // await createUniqueWebflowPropertyCodesArray(webflowItems);
        // await checkDuplicateItems(propertiesCollection);
        // await checkLiveItems(propertiesCollection);

        //Simple sleep function to get around the API call restrictions in Webflow
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }        

        //function that recursively invokes itself
        await (async function loopProperties() { // Might have to add 'await' to make sure looping properties finishes before site gets published!
            for (property of properties) {
                // uniquePalacePropertyCodes.push(property.PropertyCode); // NOTE: This needs to be outside of this for loop as it doubles everything up. Should be in its own foor loop, going through it only once!
    
                propertyaddress1                                = property.PropertyAddress1;
                propertyaddress2                                = property.PropertyAddress2;
                propertyaddress3                                = property.PropertyAddress3;
                propertyaddress4                                = property.PropertyAddress4;
                        // Property Agent Details
                        propertyagentcode                               = property.PropertyAgent === null ? "" : property.PropertyAgent.PropertyAgentCode;
                        propertyagentemail1                             = property.PropertyAgent === null ? "" : property.PropertyAgent.PropertyAgentEmail1;
                        propertyagentemail2                             = property.PropertyAgent === null ? "" : property.PropertyAgent.PropertyAgentEmail2;
                        propertyagentfax                                = property.PropertyAgent === null ? "" : property.PropertyAgent.PropertyAgentFax;
                        propertyagentfullname                           = property.PropertyAgent === null ? "" : property.PropertyAgent.PropertyAgentFullName;
                        propertyagentphonemobile                        = property.PropertyAgent === null ? "" : property.PropertyAgent.PropertyAgentPhoneMobile;
                        propertyagentphonework                          = property.PropertyAgent === null ? "" : property.PropertyAgent.PropertyAgentPhoneWork;
                        propertyagenttitle                              = property.PropertyAgent === null ? "" : property.PropertyAgent.PropertyAgentTitle;
                        propertyexternalcodes                           = property.PropertyAgent === null ? "" : property.PropertyAgent.PropertyExternalCodes;
                propertychangecode                              = property.PropertyChangeCode;
                propertycode                                    = property.PropertyCode;
                propertycodeglobal                              = property.PropertyCodeGlobal;
                // PropertyCustomList missing
                propertydateavailable                           = property.PropertyDateAvailable;
                        // Property Features Details
                        propertyfeaturesadverttext                      = property.PropertyFeatures.PropertyAdvertText;
                        propertyfeaturesamenities                       = property.PropertyFeatures.PropertyAmenities;
                        propertyfeaturesbathroomsno                     = property.PropertyFeatures.PropertyBathroomsNo;
                        propertyfeaturesbedroomsno                      = property.PropertyFeatures.PropertyBedroomsNo;
                        propertyfeaturescarsno                          = modules.isInt(property.PropertyFeatures.PropertyCarsNo) ? property.PropertyFeatures.PropertyCarsNo : "";
                        propertyfeaturesclass                           = property.PropertyFeatures.PropertyClass;
                        propertyfeaturesensuitesno                      = property.PropertyFeatures.PropertyEnsuitesNo;
                        propertyfeaturesfeaturedetails                  = property.PropertyFeatures.PropertyFeatureDetails;
                        propertyfeaturesfloorarea                       = property.PropertyFeatures.PropertyFloorArea;
                        propertyfeaturesfurnishings                     = property.PropertyFeatures.PropertyFurnishings;
                        propertyfeaturesgeographiclocation              = property.PropertyFeatures.PropertyGeographicLocation;
                        propertyfeaturesheader                          = property.PropertyFeatures.PropertyHeader;
                        propertyfeatureslandareahectares                = property.PropertyFeatures.PropertyLandAreaHectares;
                        propertyfeatureslandareamsquared                = property.PropertyFeatures.PropertyLandAreaMSquared;
                        propertyfeaturesnewconstruction                 = property.PropertyFeatures.PropertyNewConstruction;
                        propertyfeaturesparking                         = property.PropertyFeatures.PropertyParking;
                        propertyfeaturespetsallowed                     = property.PropertyFeatures.PropertyPetsAllowed === "Yes" ? true : false;
                        propertyfeaturespostcode                        = property.PropertyFeatures.PropertyPostCode;
                        propertyfeaturespublishaddress                  = property.PropertyFeatures.PropertyPublishAddress;
                        propertyfeaturespublishentry                    = property.PropertyFeatures.PropertyPublishEntry;
                        propertyfeaturessmokersallowed                  = property.PropertyFeatures.PropertySmokersAllowed;
                        propertyfeaturesstories                         = property.PropertyFeatures.PropertyStories;
                        propertyfeaturesvirtualtoururl                  = property.PropertyFeatures.PropertyVirtualTourURL;
                        propertyfeaturesweblinkurl                      = property.PropertyFeatures.PropertyWebLinkURL;
                        propertyfeaturesyearbuilt                       = property.PropertyFeatures.PropertyYearBuilt;
                propertygrid                                    = property.PropertyGrid;
                propertymanagementtype                          = property.PropertyManagementType;
                propertyname                                    = property.PropertyName;
                propertyownercode                               = property.PropertyOwnerCode;
                propertyrentamount                              = property.PropertyRentAmount;
                propertyrentalperiod                            = property.PropertyRentalPeriod;
                propertysortcode                                = property.PropertySortCode;
                propertystatus                                  = property.PropertyStatus;
                        // 3 different types: 'TradeMe', 'Real Estate', 'REAXML (NZ)' --> Why are these neccessary?
                        // TradeMe
                        propertysuburbtrademesuburbcode                 = property.PropertySuburb[0].PropertySuburbCode;
                        propertysuburbtrademesuburbdistrictorpostcode   = property.PropertySuburb[0].PropertySuburbDistrictOrPostcode;
                        propertysuburbtrademesuburbname                 = property.PropertySuburb[0].PropertySuburbName;
                        propertysuburbtrademesuburbregionorstate        = property.PropertySuburb[0].PropertySuburbRegionOrState;
                        propertysuburbtrademesuburbtype                 = property.PropertySuburb[0].PropertySuburbType;
                        // Real Estate
                        propertysuburbrealestatesuburbcode              = property.PropertySuburb[1].PropertySuburbCode;
                        propertysuburbrealestatesuburbdistrictorpostcode= property.PropertySuburb[1].PropertySuburbDistrictOrPostcode;
                        propertysuburbrealestatesuburbname              = property.PropertySuburb[1].PropertySuburbName;
                        propertysuburbrealestatesuburbregionorstate     = property.PropertySuburb[1].PropertySuburbRegionOrState;
                        propertysuburbrealestatesuburbtype              = property.PropertySuburb[1].PropertySuburbType;
                        // REAXML (NZ)
                        propertysuburbreaxmlsuburbcode                  = property.PropertySuburb[2].PropertySuburbCode;
                        propertysuburbreaxmlsuburbdistrictorpostcode    = property.PropertySuburb[2].PropertySuburbDistrictOrPostcode;
                        propertysuburbreaxmlsuburbname                  = property.PropertySuburb[2].PropertySuburbName;
                        propertysuburbreaxmlsuburbregionorstate         = property.PropertySuburb[2].PropertySuburbRegionOrState;
                        propertysuburbreaxmlsuburbtype                  = property.PropertySuburb[2].PropertySuburbType;
                propertyunit                                    = property.PropertyUnit;

                propertydateavailableNew = new Date(propertydateavailable);
                propertydateavailableIsoDate = propertydateavailableNew.toISOString();

                name = "";

                // Creating the name of the property that will be pushed to Webflow
                if (property.PropertyFeatures.PropertyPublishAddress === "No") {
                    name = `${propertyaddress1.trim()} ${propertyaddress2.trim()}`;
                } else {
                    if (property.PropertyUnit) {
                        if (property.PropertyUnit.indexOf("Flat") === -1) {
                            name += `Unit `;
                        }
                        name += `${propertyunit}, `
                    }
                    name += `${propertyaddress1.trim()} ${propertyaddress2.trim()}, ${propertyaddress3.trim()}, ${propertyaddress4.trim()}`;
                }

                //name = `${propertyaddress1} ${propertyaddress2} ${propertyaddress3} ${propertyaddress4}`;
                
                consoleLogger.log(`Property No: ${propertyLoopCounter + 1}`);
                consoleLogger.log(`Name: ${name}`);
                consoleLogger.log(`Property Code: ${property.PropertyCode}`);
    
                await getImages(propertycode)
                .then(imgArr => {
                    propertyimageArray = imgArr;
                });

                const uniqueWebflowListingsCollectionsArrayItems = await pullWebflowItems(uniqueWebflowListingsCollectionsArray[1]);
                consoleLogger.log(`Number of items in first Collection: ${uniqueWebflowListingsCollectionsArrayItems.items.length}`);

                if (propertyLoopCounter < 100 && uniqueWebflowListingsCollectionsArrayItems.items.length < 100) {
                    await createListings(uniqueWebflowListingsCollectionsArray[1]);
                } else {
                    await createListings(uniqueWebflowListingsCollectionsArray[0]);
                }
                
                propertyLoopCounter ++;

                //call sleep function from above (might have to increase timer)
                await sleep(2000);
            }
        })();
    } catch (err) {
        consoleLogger.error(`Error - Problem loading listing: ${err}`); 
    }
    
};

const cleanUpWebflowSuburbs = async () => {
    try {
        const response = await connectToAvailablePalaceProperties();
        const properties = response.data;

        await createUniquePalaceSuburbCodesArray(properties);

        const webflowSuburbItems = await pullWebflowItems(suburbsCollection);
        await createUniqueWebflowSuburbCodesArray(webflowSuburbItems);
        await checkDuplicateSuburbItems(suburbsCollection);
        await checkLiveSuburbItems(suburbsCollection);
    } catch (err) {
        consoleLogger.error(`Error Cleaning Up Webflow Suburbs: ${err}`); 
    }
}

const cleanUpWebflowDistricts = async () => {
    try {
        const response = await connectToAvailablePalaceProperties();
        const properties = response.data;

        await createUniquePalaceDistrictNamesArray(properties);

        const webflowDistrictItems = await pullWebflowItems(districtsCollection);
        await createUniqueWebflowDistrictNamesArray(webflowDistrictItems);
        await checkDuplicateDistrictItems(districtsCollection);
        await checkLiveDistrictItems(districtsCollection);
    } catch (err) {
        consoleLogger.error(`Error Cleaning Up Webflow Districts: ${err}`); 
    }
}

const cleanUpWebflowRegions = async () => {
    try {
        const response = await connectToAvailablePalaceProperties();
        const properties = response.data;

        await createUniquePalaceRegionNamesArray(properties);

        const webflowRegionItems = await pullWebflowItems(regionsCollection);
        await createUniqueWebflowRegionNamesArray(webflowRegionItems);
        await checkDuplicateRegionItems(regionsCollection);
        await checkLiveRegionItems(regionsCollection);
    } catch (err) {
        consoleLogger.error(`Error Cleaning Up Webflow Regions: ${err}`); 
    }
}

const getPalaceRegions = async () => {
    try {
        const response = await connectToAvailablePalaceProperties();
        const properties = response.data;

        //Simple sleep function to get around the API call restrictions in Webflow
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }        

        //function that recursively invokes itself
        await (async function loopProperties() { // Might have to add 'await' to make sure looping properties finishes before site gets published!
            for (property of properties) {
                // uniquePalacePropertyCodes.push(property.PropertyCode); // NOTE: This needs to be outside of this for loop as it doubles everything up. Should be in its own foor loop, going through it only once!
    
                        propertysuburbtrademesuburbcode                 = property.PropertySuburb[0].PropertySuburbCode;
                        propertysuburbtrademesuburbdistrictorpostcode   = property.PropertySuburb[0].PropertySuburbDistrictOrPostcode;
                        propertysuburbtrademesuburbname                 = property.PropertySuburb[0].PropertySuburbName;
                        propertysuburbtrademesuburbregionorstate        = property.PropertySuburb[0].PropertySuburbRegionOrState;
                        propertysuburbtrademesuburbtype                 = property.PropertySuburb[0].PropertySuburbType;

                name = `${propertysuburbtrademesuburbregionorstate.trim()}`;

                consoleLogger.log(`Region No: ${regionLoopCounter + 1}`);
                consoleLogger.log(`Region Name: ${property.PropertySuburb[0].PropertySuburbRegionOrState}`);
    
                await createRegion(regionsCollection);
  
                regionLoopCounter ++;

                if (!uniqueWebflowRegionNamesArray.includes(propertysuburbtrademesuburbregionorstate)) {
                    uniqueWebflowRegionNamesArray.push(propertysuburbtrademesuburbregionorstate);
                    consoleLogger.log(`UPDATED Unique Webflow Region Names: ${uniqueWebflowRegionNamesArray}`);
                }
                consoleLogger.log("");

                //call sleep function from above (might have to increase timer)
                await sleep(1100);
            }
        })();
    } catch (err) {
        consoleLogger.error(`Error - Problem loading suburb: ${err}`); 
    }
}

const getPalaceDistricts = async () => {
    try {
        const response = await connectToAvailablePalaceProperties();
        const properties = response.data;

        //Simple sleep function to get around the API call restrictions in Webflow
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }        

        //function that recursively invokes itself
        await (async function loopProperties() { // Might have to add 'await' to make sure looping properties finishes before site gets published!
            for (property of properties) {
                // uniquePalacePropertyCodes.push(property.PropertyCode); // NOTE: This needs to be outside of this for loop as it doubles everything up. Should be in its own foor loop, going through it only once!
    
                        propertysuburbtrademesuburbcode                 = property.PropertySuburb[0].PropertySuburbCode;
                        propertysuburbtrademesuburbdistrictorpostcode   = property.PropertySuburb[0].PropertySuburbDistrictOrPostcode;
                        propertysuburbtrademesuburbname                 = property.PropertySuburb[0].PropertySuburbName;
                        propertysuburbtrademesuburbregionorstate        = property.PropertySuburb[0].PropertySuburbRegionOrState;
                        propertysuburbtrademesuburbtype                 = property.PropertySuburb[0].PropertySuburbType;

                name = `${propertysuburbtrademesuburbdistrictorpostcode.trim()}`;

                consoleLogger.log(`District No: ${districtLoopCounter + 1}`);
                consoleLogger.log(`District Name: ${property.PropertySuburb[0].PropertySuburbDistrictOrPostcode}`);
    
                await createDistrict(districtsCollection);
                
                districtLoopCounter ++;

                if (!uniqueWebflowDistrictNamesArray.includes(propertysuburbtrademesuburbdistrictorpostcode)) {
                    uniqueWebflowDistrictNamesArray.push(propertysuburbtrademesuburbdistrictorpostcode);
                    consoleLogger.log(`UPDATED Unique Webflow District Names: ${uniqueWebflowDistrictNamesArray}`);
                }
                consoleLogger.log("");

                //call sleep function from above (might have to increase timer)
                await sleep(1100);
            }
        })();
    } catch (err) {
        consoleLogger.error(`Error - Problem loading suburb: ${err}`); 
    }
}

const getPalaceSuburbs = async () => {
    try {
        const response = await connectToAvailablePalaceProperties();
        const properties = response.data;

        //Simple sleep function to get around the API call restrictions in Webflow
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }        

        //function that recursively invokes itself
        await (async function loopProperties() { // Might have to add 'await' to make sure looping properties finishes before site gets published!
            for (property of properties) {
                // uniquePalacePropertyCodes.push(property.PropertyCode); // NOTE: This needs to be outside of this for loop as it doubles everything up. Should be in its own foor loop, going through it only once!
    
                        propertysuburbtrademesuburbcode                 = property.PropertySuburb[0].PropertySuburbCode;
                        propertysuburbtrademesuburbdistrictorpostcode   = property.PropertySuburb[0].PropertySuburbDistrictOrPostcode;
                        propertysuburbtrademesuburbname                 = property.PropertySuburb[0].PropertySuburbName;
                        propertysuburbtrademesuburbregionorstate        = property.PropertySuburb[0].PropertySuburbRegionOrState;
                        propertysuburbtrademesuburbtype                 = property.PropertySuburb[0].PropertySuburbType;

                name = `${propertysuburbtrademesuburbname.trim()}`;

                consoleLogger.log(`Suburb No: ${suburbLoopCounter + 1}`);
                consoleLogger.log(`Name: ${name}`);
                consoleLogger.log(`Suburb Code: ${property.PropertySuburb[0].PropertySuburbCode}`);

                await createSuburb(suburbsCollection);
                
                suburbLoopCounter ++;

                if (!uniqueWebflowSuburbCodesArray.includes(propertysuburbtrademesuburbcode)) {
                    uniqueWebflowSuburbCodesArray.push(propertysuburbtrademesuburbcode);
                    consoleLogger.log(`UPDATED Unique Webflow Suburb Codes: ${uniqueWebflowSuburbCodesArray}`);
                }
                consoleLogger.log("");

                //call sleep function from above (might have to increase timer)
                await sleep(1100);
    
            }
        })();
    } catch (err) {
        consoleLogger.error(`Error - Problem loading suburb: ${err}`); 
    }
}

async function connectToAvailablePalaceProperties() {
    return await axios.get('https://api.getpalace.com/Service.svc/RestService/v2AvailableProperties/JSON', {
        headers: {
            'Content-Type': 'application/json'
        },
        auth: {
            username: palaceEmail,
            password: palacePass
        }
    });
}

function getImages(code) {
    //consoleLogger.log(`Property Code for Image: ${code}`);
    return axios.get('https://api.getpalace.com/Service.svc/RestService/v2AvailablePropertyImagesURL/JSON/' + code, {
        headers: {
            'Content-Type': 'application/json'
        },
        auth: {
            username: palaceEmail,
            password: palacePass
        }
    })
    .then((response) => {
        const imagesArray = response.data;

        let propertyImages = [];

        for (const image of imagesArray) {
            propertyImages.push(image.PropertyImageURL);
        }
        consoleLogger.log(`getImages() Array Length: ${propertyImages.length}`);
        consoleLogger.log(`getImages() Array First Element: ${propertyImages[0]}`);
        //consoleLogger.log(`getImages() Array: ${propertyImages}`);
        return propertyImages;
    })
    .catch((err) => {
        consoleLogger.error(`Error - Problems loading image: ${err}`);
    })
}

// function to pull collections and number of collections
async function pullWebflowCollections() {
    return webflow.collections({
        siteId: site_id
    })
}

async function createUniqueWebflowListingsCollectionsArray(webflowCollections) {
    for (var i = 0; i < webflowCollections.length; i++) {
        //If statement to check if Collection has "Property Listings" to only add the Collections that are supposed to contain properties
        if (webflowCollections[i].name.includes("Property Listings")) { 
            uniqueWebflowListingsCollectionsArray.push(webflowCollections[i]._id);
        }
    }
    consoleLogger.log(`Unique Webflow Listings Collections Length: ${uniqueWebflowListingsCollectionsArray.length}`);
    return uniqueWebflowListingsCollectionsArray;
}

async function createUniqueWebflowRegionsCollectionsArray(webflowCollections) {
    for (var i = 0; i < webflowCollections.length; i++) {
        //If statement to check if Collection has "Property Listings" to only add the Collections that are supposed to contain properties
        if (webflowCollections[i].name.includes("PropertyRegions")) { 
            uniqueWebflowRegionsCollectionsArray.push(webflowCollections[i]._id);
        }
    }
    consoleLogger.log(`Unique Webflow Regions Collections Length: ${uniqueWebflowRegionsCollectionsArray.length}`);
    return uniqueWebflowRegionsCollectionsArray;
}

async function createUniqueWebflowDistrictsCollectionsArray(webflowCollections) {
    for (var i = 0; i < webflowCollections.length; i++) {
        //If statement to check if Collection has "Property Listings" to only add the Collections that are supposed to contain properties
        if (webflowCollections[i].name.includes("PropertyDistricts")) { 
            uniqueWebflowDistrictsCollectionsArray.push(webflowCollections[i]._id);
        }
    }
    consoleLogger.log(`Unique Webflow Districts Collections Length: ${uniqueWebflowDistrictsCollectionsArray.length}`);
    return uniqueWebflowDistrictsCollectionsArray;
}

async function createUniqueWebflowSuburbsCollectionsArray(webflowCollections) {
    for (var i = 0; i < webflowCollections.length; i++) {
        //TO ADD: if statement to check if Collection has "Property Listings" to only add the Collections that are supposed to contain properties
        if (webflowCollections[i].name.includes("PropertySuburbs")) { 
            uniqueWebflowSuburbsCollectionsArray.push(webflowCollections[i]._id);
        }
    }
    consoleLogger.log(`Unique Webflow Suburbs Collections Length: ${uniqueWebflowSuburbsCollectionsArray.length}`);
    return uniqueWebflowSuburbsCollectionsArray;
}

// Pull all items across all collections and check againsrt live items in Webflow
async function loopListingsCollectionsAndPullItems(uniqueWebflowListingsCollectionsArray) {
    // Determine collections list.length and loop with for loop through to retrieve all items within all collections. Push all items into uniqueWebflowPropertyCodes
    consoleLogger.log(`Unique Webflow Collections: ${uniqueWebflowListingsCollectionsArray}`);

    // consoleLogger.log(`Webflow Collections: ${webflowCollections[i].name}`);
    
    for (const uniqueWebflowListingsCollection of uniqueWebflowListingsCollectionsArray) {
        consoleLogger.log(`Unique Webflow Collections to iterate: ${uniqueWebflowListingsCollection}`);
        
        const webflowItems = await pullWebflowItems(uniqueWebflowListingsCollection);
        await createUniqueWebflowPropertyCodesArray(webflowItems);
        await checkDuplicateItems(uniqueWebflowListingsCollection);
        await checkLiveItems(uniqueWebflowListingsCollection);

        consoleLogger.log(`Number of items in Collection: ${webflowItems.items.length}`);   
    }
    consoleLogger.log(' ');
};

async function loopRegionsCollectionsAndPullItems(uniqueWebflowRegionsCollectionsArray) {
    // Determine collections list.length and loop with for loop through to retrieve all items within all collections. Push all items into uniqueWebflowPropertyCodes
    consoleLogger.log(`Unique Webflow Region Collections: ${uniqueWebflowRegionsCollectionsArray}`);

    // consoleLogger.log(`Webflow Collections: ${webflowCollections[i].name}`);
    
    for (const uniqueWebflowRegionsCollection of uniqueWebflowRegionsCollectionsArray) {
        consoleLogger.log(`Unique Webflow Region Collections to iterate: ${uniqueWebflowRegionsCollection}`);
        
        const webflowRegionItems = await pullWebflowItems(uniqueWebflowRegionsCollection);
        await createUniqueWebflowRegionNamesArray(webflowRegionItems);
        await checkDuplicateRegionItems(uniqueWebflowRegionsCollection);
        await checkLiveRegionItems(uniqueWebflowRegionsCollection);
    }
    
    consoleLogger.log(' ');
};

async function loopDistrictsCollectionsAndPullItems(uniqueWebflowDistrictsCollectionsArray) {
    // Determine collections list.length and loop with for loop through to retrieve all items within all collections. Push all items into uniqueWebflowPropertyCodes
    consoleLogger.log(`Unique Webflow District Collections: ${uniqueWebflowDistrictsCollectionsArray}`);

    // consoleLogger.log(`Webflow Collections: ${webflowCollections[i].name}`);
    
    for (const uniqueWebflowDistrictsCollection of uniqueWebflowDistrictsCollectionsArray) {
        consoleLogger.log(`Unique Webflow District Collections to iterate: ${uniqueWebflowDistrictsCollection}`);
        
        const webflowDistrictItems = await pullWebflowItems(uniqueWebflowDistrictsCollection);
        await createUniqueWebflowDistrictNamesArray(webflowDistrictItems);
        await checkDuplicateDistrictItems(uniqueWebflowDistrictsCollection);
        await checkLiveDistrictItems(uniqueWebflowDistrictsCollection);
    }
    
    consoleLogger.log(' ');
};

async function loopSuburbsCollectionsAndPullItems(uniqueWebflowSuburbsCollectionsArray) {
    // Determine collections list.length and loop with for loop through to retrieve all items within all collections. Push all items into uniqueWebflowPropertyCodes
    consoleLogger.log(`Unique Webflow Suburb Collections: ${uniqueWebflowSuburbsCollectionsArray}`);

    // consoleLogger.log(`Webflow Collections: ${webflowCollections[i].name}`);
    
    for (const uniqueWebflowSuburbsCollection of uniqueWebflowSuburbsCollectionsArray) {
        consoleLogger.log(`Unique Webflow Suburb Collections to iterate: ${uniqueWebflowSuburbsCollection}`);
        
        const webflowItems = await pullWebflowItems(uniqueWebflowSuburbsCollection);
        await createUniqueWebflowSuburbCodesArray(webflowItems);
        await checkDuplicateSuburbItems(uniqueWebflowSuburbsCollection);
        await checkLiveSuburbItems(uniqueWebflowSuburbsCollection);
    }
    
    consoleLogger.log(' ');
};

async function pullWebflowItems(uniqueWebflowCollection) {
    return webflow.items({
        collectionId: uniqueWebflowCollection
    })
}

async function createUniqueWebflowPropertyCodesArray(webflowItems) {
    listOfItems = webflowItems.items;
    for (var i = 0; i < listOfItems.length; i++) {
        uniqueWebflowPropertyCodesArray.push(listOfItems[i].propertycode);
    }
    consoleLogger.log(`Unique Webflow Property Codes: ${uniqueWebflowPropertyCodesArray}`);

    return uniqueWebflowPropertyCodesArray;
}

async function createUniqueWebflowRegionNamesArray(webflowItems) {
    listOfItems = webflowItems.items;
    for (var i = 0; i < listOfItems.length; i++) {
        uniqueWebflowRegionNamesArray.push(listOfItems[i].name);
    }
    consoleLogger.log(`Unique Webflow Region Codes: ${uniqueWebflowRegionNamesArray}`);
}

async function createUniqueWebflowDistrictNamesArray(webflowItems) {
    listOfItems = webflowItems.items;
    for (var i = 0; i < listOfItems.length; i++) {
        uniqueWebflowDistrictNamesArray.push(listOfItems[i].name);
    }
    consoleLogger.log(`Unique Webflow District Names: ${uniqueWebflowDistrictNamesArray}`);
}

async function createUniquePalaceSuburbCodesArray(properties) {
    for (const property of properties) {
        consoleLogger.log(" ");
        consoleLogger.log(`Unique Palace Suburb Codes Array: ${uniquePalaceSuburbCodesArray}`);
        consoleLogger.log(`Palace Suburb Code to include: ${property.PropertySuburb[0].PropertySuburbCode}`);
        // FOR THE SUBURBS THE CODES ARE NOT UNIQUE BECAUSE THEY CAN BE SAME WITHIN A PROPERTY OBJECT - NEEDS TO BE CLEANED UP WITH DUPLICATES BEEING DELETED
        if (!uniquePalaceSuburbCodesArray.includes(property.PropertySuburb[0].PropertySuburbCode)) {
            uniquePalaceSuburbCodesArray.push(property.PropertySuburb[0].PropertySuburbCode); // NOTE: This needs to be outside of this for loop as it doubles everything up. Should be in its own foor loop, going through it only once!
        } else {
            consoleLogger.log(`Palace Suburb Code already exists - next one...`);
        }
        consoleLogger.log(" ");
    }
    consoleLogger.log(`Unique Palace Suburb Codes: ${uniquePalaceSuburbCodesArray}`);
    consoleLogger.log(' ');
}

async function createUniquePalaceDistrictNamesArray(properties) {
    for (const property of properties) {
        consoleLogger.log(" ");
        consoleLogger.log(`Unique Palace District Names Array: ${uniquePalaceDistrictNamesArray}`);
        consoleLogger.log(`Palace District Name to include: ${property.PropertySuburb[0].PropertySuburbDistrictOrPostcode}`);
        // FOR THE SUBURBS THE CODES ARE NOT UNIQUE BECAUSE THEY CAN BE SAME WITHIN A PROPERTY OBJECT - NEEDS TO BE CLEANED UP WITH DUPLICATES BEEING DELETED
        if (!uniquePalaceDistrictNamesArray.includes(property.PropertySuburb[0].PropertySuburbDistrictOrPostcode)) {
            uniquePalaceDistrictNamesArray.push(property.PropertySuburb[0].PropertySuburbDistrictOrPostcode); // NOTE: This needs to be outside of this for loop as it doubles everything up. Should be in its own foor loop, going through it only once!
        } else {
            consoleLogger.log(`Palace District Name already exists - next one...`);
        }
        consoleLogger.log(" ");
    }
    consoleLogger.log(`Unique Palace District Names: ${uniquePalaceDistrictNamesArray}`);
    consoleLogger.log(' ');
}

async function createUniquePalaceRegionNamesArray(properties) {
    for (const property of properties) {
        consoleLogger.log(" ");
        consoleLogger.log(`Unique Palace Region Names Array: ${uniquePalaceRegionNamesArray}`);
        consoleLogger.log(`Palace Region Name to include: ${property.PropertySuburb[0].PropertySuburbRegionOrState}`);
        // FOR THE SUBURBS THE CODES ARE NOT UNIQUE BECAUSE THEY CAN BE SAME WITHIN A PROPERTY OBJECT - NEEDS TO BE CLEANED UP WITH DUPLICATES BEEING DELETED
        if (!uniquePalaceRegionNamesArray.includes(property.PropertySuburb[0].PropertySuburbRegionOrState)) {
            uniquePalaceRegionNamesArray.push(property.PropertySuburb[0].PropertySuburbRegionOrState); // NOTE: This needs to be outside of this for loop as it doubles everything up. Should be in its own foor loop, going through it only once!
        } else {
            consoleLogger.log(`Palace Region Name already exists - next one...`);
        }
        consoleLogger.log(" ");
    }
    consoleLogger.log(`Unique Palace Region Names: ${uniquePalaceRegionNamesArray}`);
    consoleLogger.log(' ');
}

async function createUniqueWebflowSuburbCodesArray(webflowItems) {
    listOfItems = webflowItems.items;
    for (var i = 0; i < listOfItems.length; i++) {
        uniqueWebflowSuburbCodesArray.push(listOfItems[i].propertysuburbcode);
    }
    consoleLogger.log(`Unique Webflow Suburb Codes: ${uniqueWebflowSuburbCodesArray}`);
}

async function checkDuplicateItems(webflowCollection) {
    let duplicateItems = findDuplicates(uniqueWebflowPropertyCodesArray);
    duplicateItems = [...new Set(duplicateItems)]; 
    
    if (duplicateItems.length == 0) {
        consoleLogger.log("No duplicate Items.");
    } else {
        consoleLogger.log(`Duplicate Items to delete: ${duplicateItems}`);
        for (duplicateItem of duplicateItems) {
            for (var i = 0; i < listOfItems.length; i++) {
                if (listOfItems[i].propertycode == duplicateItem) {
                    duplicateItemCodetoDelete = listOfItems[i]._id;
                    consoleLogger.log(`Item ${duplicateItem} (Code: ${duplicateItemCodetoDelete}) to delete in Collection ${webflowCollection}`);
                    await deleteItem(webflowCollection, duplicateItemCodetoDelete, duplicateItem);
                } 
            }
        }
    }
}

async function checkDuplicateRegionItems(webflowCollection) {
    let duplicateItems = findDuplicates(uniqueWebflowRegionNamesArray);
    duplicateItems = [...new Set(duplicateItems)]; 
    
    if (duplicateItems.length == 0) {
        consoleLogger.log("No duplicate Items.");
        consoleLogger.log("");
    } else {
        consoleLogger.log(`Duplicate Items to delete: ${duplicateItems}`);
        for (duplicateItem of duplicateItems) {
            for (var i = 0; i < listOfItems.length; i++) {
                if (listOfItems[i].name == duplicateItem) {
                    duplicateItemCodetoDelete = listOfItems[i]._id;
                    consoleLogger.log(`Item ${duplicateItem} (Code: ${duplicateItemCodetoDelete}) to delete in Collection ${webflowCollection}`);
                    await deleteItem(webflowCollection, duplicateItemCodetoDelete, duplicateItem);
                } 
            }
        }
    }
}

async function checkDuplicateDistrictItems(webflowCollection) {
    let duplicateItems = findDuplicates(uniqueWebflowDistrictNamesArray);
    duplicateItems = [...new Set(duplicateItems)]; 
    
    if (duplicateItems.length == 0) {
        consoleLogger.log("No duplicate Items.");
        consoleLogger.log("");
    } else {
        consoleLogger.log(`Duplicate Items to delete: ${duplicateItems}`);
        for (duplicateItem of duplicateItems) {
            for (var i = 0; i < listOfItems.length; i++) {
                if (listOfItems[i].name == duplicateItem) {
                    duplicateItemCodetoDelete = listOfItems[i]._id;
                    consoleLogger.log(`Item ${duplicateItem} (Code: ${duplicateItemCodetoDelete}) to delete in Collection ${webflowCollection}`);
                    await deleteItem(webflowCollection, duplicateItemCodetoDelete, duplicateItem);
                } 
            }
        }
    }
}

async function checkDuplicateSuburbItems(webflowCollection) {
    let duplicateItems = findDuplicates(uniqueWebflowSuburbCodesArray);
    duplicateItems = [...new Set(duplicateItems)]; 
    
    if (duplicateItems.length == 0) {
        consoleLogger.log("No duplicate Items.");
        consoleLogger.log("");
    } else {
        consoleLogger.log(`Duplicate Items to delete: ${duplicateItems}`);
        for (duplicateItem of duplicateItems) {
            for (var i = 0; i < listOfItems.length; i++) {
                if (listOfItems[i].propertysuburbcode == duplicateItem) {
                    duplicateItemCodetoDelete = listOfItems[i]._id;
                    consoleLogger.log(`Item ${duplicateItem} (Code: ${duplicateItemCodetoDelete}) to delete in Collection ${webflowCollection}`);
                    await deleteItem(webflowCollection, duplicateItemCodetoDelete, duplicateItem);
                } 
            }
        }
    }
}

//Checking to see if there is anything inside webflow thats not inside Palace to delete
async function checkLiveItems(webflowCollection) {
    // diff(): Returns an array with only the unique values from the first array, by
    // excluding all values from additional arrays using strict equality for comparisons.
    itemsToDelete = diff(uniqueWebflowPropertyCodesArray, uniquePalacePropertyCodesArray);
    if (itemsToDelete.length == 0){
        consoleLogger.log("Nothing to delete.");
        consoleLogger.log("");
        return;
    } else {
        consoleLogger.log(`Items to delete: ${itemsToDelete}`);
        consoleLogger.log(`Items to delete length: ${itemsToDelete.length}`);
        for (itemToDelete of itemsToDelete) {
            // consoleLogger.log(`Next item to delete: ${itemToDelete}`);
            for (var i = 0; i < listOfItems.length; i++) {
                if (listOfItems[i].propertycode == itemToDelete) {
                    itemCodetoDelete = listOfItems[i]._id;
                    consoleLogger.log(`Item ${itemToDelete} (Code: ${itemCodetoDelete}) to delete in Collection ${webflowCollection}`);
                    await deleteItem(webflowCollection, itemCodetoDelete, itemToDelete);
                } 
                // else {
                //     consoleLogger.log(`Webflow property ${listOfItems[i].propertycode} not equal to item property code to delete: ${itemToDelete}`);
                // }
            }
        }
    }
}

//Checking to see if there is anything inside webflow thats not inside Palace to delete
async function checkLiveRegionItems(webflowCollection) {
    // diff(): Returns an array with only the unique values from the first array, by
    // excluding all values from additional arrays using strict equality for comparisons.
    itemsToDelete = diff(uniqueWebflowRegionNamesArray, uniquePalaceRegionNamesArray);
    if (itemsToDelete.length == 0){
        consoleLogger.log("Nothing to delete.");
        consoleLogger.log("");
        return;
    } else {
        consoleLogger.log(`Region Items to delete: ${itemsToDelete}`);
        consoleLogger.log(`Region Items to delete length: ${itemsToDelete.length}`);
        for (itemToDelete of itemsToDelete) {
            // consoleLogger.log(`Next item to delete: ${itemToDelete}`);
            for (var i = 0; i < listOfItems.length; i++) {
                // changed propertyregioncode to name
                if (listOfItems[i].name == itemToDelete) {
                    itemCodetoDelete = listOfItems[i]._id;
                    consoleLogger.log(`Item ${itemToDelete} (Code: ${itemCodetoDelete}) to delete in Collection ${webflowCollection}`);
                    await deleteItem(webflowCollection, itemCodetoDelete, itemToDelete);
                } 
                // else {
                //     consoleLogger.log(`Webflow property ${listOfItems[i].propertycode} not equal to item property code to delete: ${itemToDelete}`);
                // }
            }
        }
    }
}

//Checking to see if there is anything inside webflow thats not inside Palace to delete
async function checkLiveDistrictItems(webflowCollection) {
    // diff(): Returns an array with only the unique values from the first array, by
    // excluding all values from additional arrays using strict equality for comparisons.
    itemsToDelete = diff(uniqueWebflowDistrictNamesArray, uniquePalaceDistrictNamesArray);
    if (itemsToDelete.length == 0){
        consoleLogger.log("Nothing to delete.");
        consoleLogger.log("");
        return;
    } else {
        consoleLogger.log(`District Items to delete: ${itemsToDelete}`);
        consoleLogger.log(`District Items to delete length: ${itemsToDelete.length}`);
        for (itemToDelete of itemsToDelete) {
            // consoleLogger.log(`Next item to delete: ${itemToDelete}`);
            for (var i = 0; i < listOfItems.length; i++) {
                if (listOfItems[i].name == itemToDelete) {
                    itemCodetoDelete = listOfItems[i]._id;
                    consoleLogger.log(`Item ${itemToDelete} (Code: ${itemCodetoDelete}) to delete in Collection ${webflowCollection}`);
                    await deleteItem(webflowCollection, itemCodetoDelete, itemToDelete);
                } 
                // else {
                //     consoleLogger.log(`Webflow property ${listOfItems[i].propertycode} not equal to item property code to delete: ${itemToDelete}`);
                // }
            }
        }
    }
}

//Checking to see if there is anything inside webflow thats not inside Palace to delete
async function checkLiveSuburbItems(webflowCollection) {
    // diff(): Returns an array with only the unique values from the first array, by
    // excluding all values from additional arrays using strict equality for comparisons.
    itemsToDelete = diff(uniqueWebflowSuburbCodesArray, uniquePalaceSuburbCodesArray);
    if (itemsToDelete.length == 0){
        consoleLogger.log("Nothing to delete.");
        consoleLogger.log("");
        return;
    } else {
        consoleLogger.log(`Suburb Items to delete: ${itemsToDelete}`);
        consoleLogger.log(`Suburb Items to delete length: ${itemsToDelete.length}`);
        for (itemToDelete of itemsToDelete) {
            // consoleLogger.log(`Next item to delete: ${itemToDelete}`);
            for (var i = 0; i < listOfItems.length; i++) {
                if (listOfItems[i].propertysuburbcode == itemToDelete) {
                    itemCodetoDelete = listOfItems[i]._id;
                    consoleLogger.log(`Item ${itemToDelete} (Code: ${itemCodetoDelete}) to delete in Collection ${webflowCollection}`);
                    await deleteItem(webflowCollection, itemCodetoDelete, itemToDelete);
                } 
                // else {
                //     consoleLogger.log(`Webflow property ${listOfItems[i].propertycode} not equal to item property code to delete: ${itemToDelete}`);
                // }
            }
        }
    }
}

async function deleteItem(webflowCollectionId, itemCodetoDelete, itemNametoDelete) {
    try {
        webflow.removeItem({
            collectionId: webflowCollectionId,
            itemId: itemCodetoDelete
        });
        consoleLogger.log(`Deleted item ${itemNametoDelete} from Collection ${webflowCollectionId}`);
        consoleLogger.log("");
    } catch (err) {
        consoleLogger.error(`Error - Problem deleting item ${itemNametoDelete} from Collection ${webflowCollectionId}: ${err}`);
    }
}

async function createListings(createInWebflowCollection) {
    try {
        // consoleLogger.log(`Palace Property Code to be imported: ${propertycode}`);
        // consoleLogger.log(`Palace Property Image: ${propertyimageArray[0]}`);
        // consoleLogger.log(`Palace Property Image Array: ${propertyimageArray}`);
        // consoleLogger.log(`Palace Property Image Array Length: ${propertyimageArray.length}`);

        if (uniqueWebflowPropertyCodesArray.includes(propertycode)) { // ***** IMPLEMENT CONDITIONAL LOGIC to check if property is active. Import only if property is active! *****
            consoleLogger.log("Property exists already - STOP");
            consoleLogger.log("");
        } else {
            // Creates an array of image objects for the property image gallery
            function createJsonArray() {
                const jsonArray = [];

                propertyimageArray.forEach(el => {
                    string = '{ "url": "' + el + '" }';
                    obj = JSON.parse(string);
                    jsonArray.push(obj);
                });
                //consoleLogger.log(jsonArray);
                // Output:
                // [
                //     { 'url': 'http://images.getpalace.com/0e2c2606-1a59-4df7-b346-d20c7c153349/RBPI000084.jpg' }
                // ]
                return jsonArray;
            }

            webflow.createItem({
                collectionId: createInWebflowCollection,
                fields: {
                    'name': name,
                    'propertycode': propertycode,
                    'propertycodeglobal': propertycodeglobal,
                    'propertyunit': propertyunit,
                    'propertyaddress1': propertyaddress1,
                    'propertyaddress2': propertyaddress2,
                    'propertyaddress3': propertyaddress3,
                    'propertyaddress4': propertyaddress4,
                    'propertyimage': {
                        'url': propertyimageArray[0]
                    },
                    'propertyimages': createJsonArray(),
                    // [
                        // {
                        //     'url': 'http://images.getpalace.com/0e2c2606-1a59-4df7-b346-d20c7c153349/RBPI000021.jpg'
                        // },
                        // {
                        //     'url': "http://images.getpalace.com/0e2c2606-1a59-4df7-b346-d20c7c153349/RBPI000066.jpg"
                        // }
                    // ],
                    'propertyadverttext': propertyfeaturesadverttext,
                    'propertyagentfullname': propertyagentfullname,
                    'propertyagentemail1': propertyagentemail1,
                    'propertyagentphonemobile': propertyagentphonemobile,
                    'propertyagentphonework': propertyagentphonework,
                    'propertybathroomsno': propertyfeaturesbathroomsno.trim(),
                    'propertybedroomsno': propertyfeaturesbedroomsno,
                    'propertycarsno': propertyfeaturescarsno,
                    'propertydateavailable': propertydateavailableIsoDate,
                    'propertyheader': propertyfeaturesheader,
                    'propertyrentamount': propertyrentamount,
                    'propertystatus': propertystatus,
                    'propertysuburbdistrictorpostcode': propertysuburbtrademesuburbdistrictorpostcode,
                    'propertysuburbname': propertysuburbtrademesuburbname,
                    'propertysuburbregionorstate': propertysuburbtrademesuburbregionorstate,
                    'propertyclass': propertyfeaturesclass,
                    'propertypetsallowed': propertyfeaturespetsallowed,
                    '_archived': false,
                    '_draft': false,
                },
            });
            consoleLogger.log(`Created item ${name} in collection ${createInWebflowCollection}`);
            consoleLogger.log("");
        }
    } catch (err) {
        consoleLogger.error(`Error - Problem creating listing: ${err}`); 
    }
}

async function createRegion(createInWebflowCollection) {
    try {
        if (uniqueWebflowRegionNamesArray.includes(propertysuburbtrademesuburbregionorstate)) {
            consoleLogger.log("Region exists already - STOP");
            consoleLogger.log("");
        } else {
            webflow.createItem({
                collectionId: createInWebflowCollection,
                fields: {
                    'name': name,
                    '_archived': false,
                    '_draft': false,
                },
            });
            consoleLogger.log(`Created region item ${name} in collection ${createInWebflowCollection}`);
        }
    } catch (err) {
        consoleLogger.error(`Error - Problem creating listing: ${err}`); 
    }
}

async function findRegionIDForDistrict(webflowRegionItemsForDistricts) {
    listOfItems = webflowRegionItemsForDistricts.items;
    for (var i = 0; i < listOfItems.length; i++) {
        consoleLogger.log(`District:          ${propertysuburbtrademesuburbregionorstate}`);
        consoleLogger.log(`Region - District: ${listOfItems[i].name}`);
        if (listOfItems[i].name === propertysuburbtrademesuburbregionorstate) {
            const propertyRegionID = listOfItems[i]._id
            consoleLogger.log(`Region Item for the District: ${listOfItems[i].name} - ${propertyRegionID}`);
            return propertyRegionID;
        }
    }      
}

async function findDistrictIDForSuburb(webflowDistrictItemsForSuburbs) {
    listOfItems = webflowDistrictItemsForSuburbs.items;
    for (var i = 0; i < listOfItems.length; i++) {
        consoleLogger.log(`Suburb:          ${propertysuburbtrademesuburbdistrictorpostcode}`);
        consoleLogger.log(`District - Suburb: ${listOfItems[i].name}`);
        if (listOfItems[i].name === propertysuburbtrademesuburbdistrictorpostcode) {
            const propertyDistrictID = listOfItems[i]._id
            consoleLogger.log(`District Item for the Suburb: ${listOfItems[i].name} - ${propertyDistrictID}`);
            return propertyDistrictID;
        }
    }      
}

async function createDistrictItem(createInWebflowCollection, propertyRegionID) {
    webflow.createItem({
        collectionId: createInWebflowCollection,
        fields: {
            'name': name,
            "propertdistrictcode": propertysuburbtrademesuburbcode,
            "propertyregion": propertyRegionID,
            '_archived': false,
            '_draft': false,
        }
    });
    consoleLogger.log(`Created district item ${name} in collection ${createInWebflowCollection}`);
}

async function createSuburbItem(createInWebflowCollection, propertyDistrictID) {
    webflow.createItem({
        collectionId: createInWebflowCollection,
        fields: {
            'name': name,
            "propertysuburbcode": propertysuburbtrademesuburbcode,
            "propertydistrict": propertyDistrictID,
            '_archived': false,
            '_draft': false,
        }
    });
    consoleLogger.log(`Created suburb item ${name} in collection ${createInWebflowCollection}`);
}

async function createDistrict(createInWebflowCollection) {
    try {
        if (uniqueWebflowDistrictNamesArray.includes(propertysuburbtrademesuburbdistrictorpostcode)) {
            consoleLogger.log("District exists already - STOP");
            consoleLogger.log("");
        } else {
            const webflowRegionItemsForDistricts = await pullWebflowItems('634e176db5986e35b47cbf66');
            const RegionIDForDistrict = await findRegionIDForDistrict(webflowRegionItemsForDistricts);
            await createDistrictItem(createInWebflowCollection, RegionIDForDistrict)
        }
    } catch (err) {
        consoleLogger.error(`Error - Problem creating listing: ${err}`); 
    }
}

async function createSuburb(createInWebflowCollection) {
    try {
        if (uniqueWebflowSuburbCodesArray.includes(propertysuburbtrademesuburbcode)) { // ***** IMPLEMENT CONDITIONAL LOGIC to check if property is active. Import only if property is active! *****
            consoleLogger.log("Suburb exists already - STOP");
            consoleLogger.log("");
        } else {
            const webflowDistrictItemsForSuburbs = await pullWebflowItems('634e176db5986ee9f47cbf65');
            const DistrictIDForSuburb = await findDistrictIDForSuburb(webflowDistrictItemsForSuburbs);
            await createSuburbItem(createInWebflowCollection, DistrictIDForSuburb)
        }
    } catch (err) {
        consoleLogger.error(`Error - Problem creating listing: ${err}`); 
    }
}

// Publishing data to process.env.WEBFLOW_DOMAIN
async function publishToSite() {
    webflow.publishSite({
        siteId: site_id,
        domains: [webflow_domain]
    })
    .then(res => {
        consoleLogger.log(`Published site to ${webflow_domain}!`);
      }); 
}

async function fullUpload () {
    try {
        await getPalaceListings();
        await cleanUpWebflowSuburbs();
        await cleanUpWebflowDistricts();
        await cleanUpWebflowRegions();
        await getPalaceRegions();
        await getPalaceDistricts();
        await getPalaceSuburbs();
        
        publishToSite();

        transporter.sendMail(mailOptions, function(err, data) {
            if (err) {
                console.log(err);
            } else {
                console.log(data);
            }
        });
    } catch {
        consoleLogger.error(`Error - Problem doing fullUpload(): ${err}`); 
    } 
}

fullUpload();