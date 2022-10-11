const axios = require('axios');
const Webflow = require('webflow-api');
const parseString = require('xml2js').parseString;
const diff = require('arr-diff');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const findDuplicates = require('array-find-duplicates');
const { response } = require('express');

const api_key = process.env.API_KEY;
const palaceEmail = process.env.PALACE_LOGIN;
const palacePass = process.env.PALACE_PASSWORD;
const site_id = process.env.SITE_ID;
const webflow_domain = process.env.WEBFLOW_DOMAIN;
//let collections_id = process.env.COLLECTION_ID;

let itemCodetoDelete, itemPropCodeToDelete, listOfItems, itemToDelete, duplicateItem, itemsToDelete, name, propertyaddress1, propertyaddress2, propertyaddress3, propertyaddress4, propertycode, propertydateavailableNew, propertydateavailableIsoDate;
let uniqueWebflowListingsCollectionsArray = [];
let uniqueWebflowSuburbsCollectionsArray = [];
let uniqueWebflowPropertyCodesArray = [];
let uniqueWebflowSuburbCodesArray = [];
let uniquePalacePropertyCodesArray = [];
let uniquePalaceSuburbCodesArray = [];
let propertyLoopCounter = 0;
let suburbLoopCounter = 0;

const webflow = new Webflow({
    token: api_key
});

const getPalaceSuburbs = async () => {
    try {
        // await connectToAvailableProperties();
        const response = await axios.get('https://api.getpalace.com/Service.svc/RestService/v2AvailableProperties/JSON', {
            headers: {
                'Content-Type': 'application/json'
            },
            auth: {
                username: palaceEmail,
                password: palacePass
            }
        });

        const properties = response.data;

        for (const property of properties) {
            uniquePalaceSuburbCodesArray.push(property.PropertySuburb[0].PropertySuburbCode); // NOTE: This needs to be outside of this for loop as it doubles everything up. Should be in its own foor loop, going through it only once!
        }
        console.log(`Palace Suburb Codes: ${uniquePalaceSuburbCodesArray}`);
        console.log(' ');

        const webflowCollections = await pullWebflowCollections();
        const uniqueWebflowSuburbsCollectionsArray = await createUniqueWebflowSuburbsCollectionsArray(webflowCollections);
        await loopSuburbsCollectionsAndPullItems(uniqueWebflowSuburbsCollectionsArray);

        //Simple sleep function to get around the API call restrictions in Webflow
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }        

        //function that recursively invokes itself
        (async function loopProperties() { // Might have to add 'await' to make sure looping properties finishes before site gets published!
            for (property of properties) {
                // uniquePalacePropertyCodes.push(property.PropertyCode); // NOTE: This needs to be outside of this for loop as it doubles everything up. Should be in its own foor loop, going through it only once!
    
                // propertyaddress1                                = property.PropertyAddress1;
                // propertyaddress2                                = property.PropertyAddress2;
                // propertyaddress3                                = property.PropertyAddress3;
                // propertyaddress4                                = property.PropertyAddress4;
                //         // Property Agent Details
                //         propertyagentcode                               = property.PropertyAgent.PropertyAgentCode;
                //         propertyagentemail1                             = property.PropertyAgent.PropertyAgentEmail1;
                //         propertyagentemail2                             = property.PropertyAgent.PropertyAgentEmail2;
                //         propertyagentfax                                = property.PropertyAgent.PropertyAgentFax;
                //         propertyagentfullname                           = property.PropertyAgent.PropertyAgentFullName;
                //         propertyagentphonemobile                        = property.PropertyAgent.PropertyAgentPhoneMobile;
                //         propertyagentphonework                          = property.PropertyAgent.PropertyAgentPhoneWork;
                //         propertyagenttitle                              = property.PropertyAgent.PropertyAgentTitle;
                //         propertyexternalcodes                           = property.PropertyAgent.PropertyExternalCodes;
                // propertychangecode                              = property.PropertyChangeCode;
                // propertycode                                    = property.PropertyCode;
                // propertycodeglobal                              = property.PropertyCodeGlobal;
                // // PropertyCustomList missing
                // propertydateavailable                           = property.PropertyDateAvailable;
                //         // Property Features Details
                //         propertyfeaturesadverttext                      = property.PropertyFeatures.PropertyAdvertText;
                //         propertyfeaturesamenities                       = property.PropertyFeatures.PropertyAmenities;
                //         propertyfeaturesbathroomsno                     = property.PropertyFeatures.PropertyBathroomsNo;
                //         propertyfeaturesbedroomsno                      = property.PropertyFeatures.PropertyBedroomsNo;
                //         propertyfeaturescarsno                          = property.PropertyFeatures.PropertyCarsNo;
                //         propertyfeaturesclass                           = property.PropertyFeatures.PropertyClass;
                //         propertyfeaturesensuitesno                      = property.PropertyFeatures.PropertyEnsuitesNo;
                //         propertyfeaturesfeaturedetails                  = property.PropertyFeatures.PropertyFeatureDetails;
                //         propertyfeaturesfloorarea                       = property.PropertyFeatures.PropertyFloorArea;
                //         propertyfeaturesfurnishings                     = property.PropertyFeatures.PropertyFurnishings;
                //         propertyfeaturesgeographiclocation              = property.PropertyFeatures.PropertyGeographicLocation;
                //         propertyfeaturesheader                          = property.PropertyFeatures.PropertyHeader;
                //         propertyfeatureslandareahectares                = property.PropertyFeatures.PropertyLandAreaHectares;
                //         propertyfeatureslandareamsquared                = property.PropertyFeatures.PropertyLandAreaMSquared;
                //         propertyfeaturesnewconstruction                 = property.PropertyFeatures.PropertyNewConstruction;
                //         propertyfeaturesparking                         = property.PropertyFeatures.PropertyParking;
                //         propertyfeaturespetsallowed                     = property.PropertyFeatures.PropertyPetsAllowed;
                //         propertyfeaturespostcode                        = property.PropertyFeatures.PropertyPostCode;
                //         propertyfeaturespublishaddress                  = property.PropertyFeatures.PropertyPublishAddress;
                //         propertyfeaturespublishentry                    = property.PropertyFeatures.PropertyPublishEntry;
                //         propertyfeaturessmokersallowed                  = property.PropertyFeatures.PropertySmokersAllowed;
                //         propertyfeaturesstories                         = property.PropertyFeatures.PropertyStories;
                //         propertyfeaturesvirtualtoururl                  = property.PropertyFeatures.PropertyVirtualTourURL;
                //         propertyfeaturesweblinkurl                      = property.PropertyFeatures.PropertyWebLinkURL;
                //         propertyfeaturesyearbuilt                       = property.PropertyFeatures.PropertyYearBuilt;
                // propertygrid                                    = property.PropertyGrid;
                // propertymanagementtype                          = property.PropertyManagementType;
                // propertyname                                    = property.PropertyName;
                // propertyownercode                               = property.PropertyOwnerCode;
                // propertyrentamount                              = property.PropertyRentAmount;
                // propertyrentalperiod                            = property.PropertyRentalPeriod;
                // propertysortcode                                = property.PropertySortCode;
                // propertystatus                                  = property.PropertyStatus;
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

                        //const s = p.PropertySuburb[0].AvailablePropertySuburbs || [];

                        // PropertySuburb: {
                        //     AvailablePropertySuburbs: s.map((si: any) => {
                        //       return {
                        //         PropertySuburbCode: si.PropertySuburbCode[0],
                        //         PropertySuburbDistrictOrPostcode: si.PropertySuburbDistrictOrPostcode[0],
                        //         PropertySuburbName: si.PropertySuburbName[0],
                        //         PropertySuburbRegionOrState: si.PropertySuburbRegionOrState[0],
                        //         PropertySuburbType: si.PropertySuburbType[0],
                        //       };
                        //     }),
                        //   }


                // propertyunit                                    = property.PropertyUnit;

                // propertydateavailableNew = new Date(propertydateavailable);
                // propertydateavailableIsoDate = propertydateavailableNew.toISOString();

                // name = "";

                // // Creating the name of the property that will be pushed to Webflow
                // if (property.PropertyFeatures.PropertyPublishAddress === "No") {
                //     name = `${propertyaddress1.trim()} ${propertyaddress2.trim()}`;
                // } else {
                //     if (property.PropertyUnit) {
                //         if (property.PropertyUnit.indexOf("Flat") === -1) {
                //             name += `Unit `;
                //         }
                //         name += `${propertyunit}, `
                //     }
                //     name += `${propertyaddress1.trim()} ${propertyaddress2.trim()} ${propertyaddress3.trim()} ${propertyaddress4.trim()}`;
                // }

                //name = `${propertyaddress1} ${propertyaddress2} ${propertyaddress3} ${propertyaddress4}`;

                name = `${propertysuburbtrademesuburbcode.trim()} ${propertysuburbtrademesuburbname.trim()} ${propertysuburbtrademesuburbregionorstate.trim()}`;

                console.log(`Suburb No: ${suburbLoopCounter + 1}`);
                console.log(`Name: ${name}`);
                console.log(`Suburb Code: ${property.PropertySuburb[0].PropertySuburbCode}`);
    
                // await getImages(propertycode)
                // .then(imgArr => {
                //     propertyimageArray = imgArr;
                // });
                
                if (suburbLoopCounter < 300) {
                    await createSuburb(uniqueWebflowSuburbsCollectionsArray[0]);
                } else {
                    await createSuburb(uniqueWebflowSuburbsCollectionsArray[1]);
                }
                
                suburbLoopCounter ++;

                //call sleep function from above (might have to increase timer)
                await sleep(1500);
    
            }
        })();

    } catch (err) {
        console.log(`Error - Problem loading suburb: ${err}`); 
    }
}

const getPalaceListings = async () => {
    try {
        // await connectToAvailableProperties();
        const response = await axios.get('https://api.getpalace.com/Service.svc/RestService/v2AvailableProperties/JSON', {
            headers: {
                'Content-Type': 'application/json'
            },
            auth: {
                username: palaceEmail,
                password: palacePass
            }
        });

        const properties = response.data;
        
        const headerDate = response.headers && response.headers.date ? response.headers.date : 'no response date';
        console.log(' ');
        console.log(' ');
        console.log('****************************');
        console.log('Status Code:', response.status);
        console.log('Date in Response header:', headerDate);
        console.log('****************************');
        console.log(' ');
        console.log(`Properties.Length: ${properties.length}`);
        

        for (const property of properties) {
            uniquePalacePropertyCodesArray.push(property.PropertyCode); // NOTE: This needs to be outside of this for loop as it doubles everything up. Should be in its own foor loop, going through it only once!
        }
        console.log(`Palace Property Codes: ${uniquePalacePropertyCodesArray}`);
        console.log(' ');

        const webflowCollections = await pullWebflowCollections();
        const uniqueWebflowListingsCollectionsArray = await createUniqueWebflowListingsCollectionsArray(webflowCollections);
        await loopListingsCollectionsAndPullItems(uniqueWebflowListingsCollectionsArray);


        //Simple sleep function to get around the API call restrictions in Webflow
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }        

        //function that recursively invokes itself
        (async function loopProperties() { // Might have to add 'await' to make sure looping properties finishes before site gets published!
            for (property of properties) {
                // uniquePalacePropertyCodes.push(property.PropertyCode); // NOTE: This needs to be outside of this for loop as it doubles everything up. Should be in its own foor loop, going through it only once!
    
                propertyaddress1                                = property.PropertyAddress1;
                propertyaddress2                                = property.PropertyAddress2;
                propertyaddress3                                = property.PropertyAddress3;
                propertyaddress4                                = property.PropertyAddress4;
                        // Property Agent Details
                        propertyagentcode                               = property.PropertyAgent.PropertyAgentCode;
                        propertyagentemail1                             = property.PropertyAgent.PropertyAgentEmail1;
                        propertyagentemail2                             = property.PropertyAgent.PropertyAgentEmail2;
                        propertyagentfax                                = property.PropertyAgent.PropertyAgentFax;
                        propertyagentfullname                           = property.PropertyAgent.PropertyAgentFullName;
                        propertyagentphonemobile                        = property.PropertyAgent.PropertyAgentPhoneMobile;
                        propertyagentphonework                          = property.PropertyAgent.PropertyAgentPhoneWork;
                        propertyagenttitle                              = property.PropertyAgent.PropertyAgentTitle;
                        propertyexternalcodes                           = property.PropertyAgent.PropertyExternalCodes;
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
                        propertyfeaturescarsno                          = property.PropertyFeatures.PropertyCarsNo;
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
                        propertyfeaturespetsallowed                     = property.PropertyFeatures.PropertyPetsAllowed;
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

                        //const s = p.PropertySuburb[0].AvailablePropertySuburbs || [];

                        // PropertySuburb: {
                        //     AvailablePropertySuburbs: s.map((si: any) => {
                        //       return {
                        //         PropertySuburbCode: si.PropertySuburbCode[0],
                        //         PropertySuburbDistrictOrPostcode: si.PropertySuburbDistrictOrPostcode[0],
                        //         PropertySuburbName: si.PropertySuburbName[0],
                        //         PropertySuburbRegionOrState: si.PropertySuburbRegionOrState[0],
                        //         PropertySuburbType: si.PropertySuburbType[0],
                        //       };
                        //     }),
                        //   }


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
                    name += `${propertyaddress1.trim()} ${propertyaddress2.trim()} ${propertyaddress3.trim()} ${propertyaddress4.trim()}`;
                }

                //name = `${propertyaddress1} ${propertyaddress2} ${propertyaddress3} ${propertyaddress4}`;
                
                console.log(`Property No: ${propertyLoopCounter + 1}`);
                console.log(`Name: ${name}`);
                console.log(`Property Code: ${property.PropertyCode}`);
    
                await getImages(propertycode)
                .then(imgArr => {
                    propertyimageArray = imgArr;
                });
                
                if (propertyLoopCounter < 100) {
                    await createListings(uniqueWebflowListingsCollectionsArray[0]);
                } else {
                    await createListings(uniqueWebflowListingsCollectionsArray[1]);
                }
                
                propertyLoopCounter ++;

                //call sleep function from above (might have to increase timer)
                await sleep(2000);
    
            }
        })();
        
    } catch (err) {
        console.log(`Error - Problem loading listing: ${err}`); 
    }
    
};

// async function connectToAvailableProperties() {
//     const response = await axios.get('https://api.getpalace.com/Service.svc/RestService/v2AvailableProperties/JSON', {
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         auth: {
//             username: palaceEmail,
//             password: palacePass
//         }
//     });
// }

function getImages(code) {
    //console.log(`Property Code for Image: ${code}`);
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
        console.log(`getImages() Array Length: ${propertyImages.length}`);
        console.log(`getImages() Array First Element: ${propertyImages[0]}`);
        //console.log(`getImages() Array: ${propertyImages}`);
        return propertyImages;
    })
    .catch((err) => {
        console.log(`Error - Problems loading image: ${err}`);
    })
}

// function to pull collections and number of collections
async function pullWebflowCollections() {
    return webflow.collections({
        siteId: site_id
    })
    // the response is an array of the collections
    // .then(res => {
    //     for (var i = 0; i < res.length; i++) {
    //         uniqueWebflowCollections.push(res[i]._id);
    //     }
    //     console.log(`Unique Webflow Collections Length: ${uniqueWebflowCollections.length}`);
    // });
}

async function createUniqueWebflowListingsCollectionsArray(webflowCollections) {
    for (var i = 0; i < webflowCollections.length; i++) {
        //TO ADD: if statement to check if Collection has "Property Listings" to only add the Collections that are supposed to contain properties
        if (webflowCollections[i].name.includes("Property Listings")) { 
            uniqueWebflowListingsCollectionsArray.push(webflowCollections[i]._id);
        }
    }
    console.log(`Unique Webflow Listings Collections Length: ${uniqueWebflowListingsCollectionsArray.length}`);
    return uniqueWebflowListingsCollectionsArray;
}

async function createUniqueWebflowSuburbsCollectionsArray(webflowCollections) {
    for (var i = 0; i < webflowCollections.length; i++) {
        //TO ADD: if statement to check if Collection has "Property Listings" to only add the Collections that are supposed to contain properties
        if (webflowCollections[i].name.includes("PropertySuburbs")) { 
            uniqueWebflowSuburbsCollectionsArray.push(webflowCollections[i]._id);
        }
    }
    console.log(`Unique Webflow Suburbs Collections Length: ${uniqueWebflowSuburbsCollectionsArray.length}`);
    return uniqueWebflowSuburbsCollectionsArray;
}

// Pull all items across all collections and check againsrt live items in Webflow
async function loopListingsCollectionsAndPullItems(uniqueWebflowListingsCollectionsArray) {
    // Determine collections list.length and loop with for loop through to retrieve all items within all collections. Push all items into uniqueWebflowPropertyCodes
    console.log(`Unique Webflow Collections: ${uniqueWebflowListingsCollectionsArray}`);

    // console.log(`Webflow Collections: ${webflowCollections[i].name}`);
    
    for (const uniqueWebflowListingsCollection of uniqueWebflowListingsCollectionsArray) {
        console.log(`Unique Webflow Collection to iterate: ${uniqueWebflowListingsCollection}`);
        
        const webflowItems = await pullWebflowItems(uniqueWebflowListingsCollection);
        await createUniqueWebflowPropertyCodesArray(webflowItems);
        await checkDuplicateItems(uniqueWebflowListingsCollection);
        await checkLiveItems(uniqueWebflowListingsCollection);
    }
    
    console.log(' ');
};

async function loopSuburbsCollectionsAndPullItems(uniqueWebflowSuburbsCollectionsArray) {
    // Determine collections list.length and loop with for loop through to retrieve all items within all collections. Push all items into uniqueWebflowPropertyCodes
    console.log(`Unique Webflow Collections: ${uniqueWebflowSuburbsCollectionsArray}`);

    // console.log(`Webflow Collections: ${webflowCollections[i].name}`);
    
    for (const uniqueWebflowSuburbsCollection of uniqueWebflowSuburbsCollectionsArray) {
        console.log(`Unique Webflow Collection to iterate: ${uniqueWebflowSuburbsCollection}`);
        
        const webflowItems = await pullWebflowItems(uniqueWebflowSuburbsCollection);
        await createUniqueWebflowSuburbCodesArray(webflowItems);
        await checkDuplicateSuburbItems(uniqueWebflowSuburbsCollection);
        await checkLiveSuburbItems(uniqueWebflowSuburbsCollection);
    }
    
    console.log(' ');
};

async function pullWebflowItems(uniqueWebflowCollection) {
    return webflow.items({
        collectionId: uniqueWebflowCollection
    })
    // .then(res => {
    //     listOfItems = res.items;
    //     for (var i = 0; i < listOfItems.length; i++) {
    //         uniqueWebflowPropertyCodes.push(listOfItems[i].propertycode);
    //     }
    //     console.log(`Unique Webflow Property Codes: ${uniqueWebflowPropertyCodes}`);

    //     //Checking to see if there is anything inside webflow thats not inside Palace to delete
    //     checkLiveItems(uniqueWebflowCollection);
    // });
}

async function createUniqueWebflowPropertyCodesArray(webflowItems) {
    listOfItems = webflowItems.items;
    for (var i = 0; i < listOfItems.length; i++) {
        uniqueWebflowPropertyCodesArray.push(listOfItems[i].propertycode);
    }
    console.log(`Unique Webflow Property Codes: ${uniqueWebflowPropertyCodesArray}`);

    return uniqueWebflowPropertyCodesArray;

    //Checking to see if there is anything inside webflow thats not inside Palace to delete
    //checkLiveItems(uniqueWebflowCollection);
}

async function createUniqueWebflowSuburbCodesArray(webflowItems) {
    listOfItems = webflowItems.items;
    for (var i = 0; i < listOfItems.length; i++) {
        uniqueWebflowSuburbCodesArray.push(listOfItems[i].propertysuburbcode);
    }
    console.log(`Unique Webflow Suburb Codes: ${uniqueWebflowSuburbCodesArray}`);

    //Checking to see if there is anything inside webflow thats not inside Palace to delete
    //checkLiveItems(uniqueWebflowCollection);
}

async function checkDuplicateItems(webflowCollection) {
    let duplicateItems = findDuplicates(uniqueWebflowPropertyCodesArray);
    duplicateItems = [...new Set(duplicateItems)]; 
    
    if (duplicateItems.length == 0) {
        console.log("No duplicate Items.");
    } else {
        console.log(`Duplicate Items to delete: ${duplicateItems}`);
        for (duplicateItem of duplicateItems) {
            for (var i = 0; i < listOfItems.length; i++) {
                if (listOfItems[i].propertycode == duplicateItem) {
                    duplicateItemCodetoDelete = listOfItems[i]._id;
                    console.log(`Item ${duplicateItem} (Code: ${duplicateItemCodetoDelete}) to delete in Collection ${webflowCollection}`);
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
        console.log("No duplicate Items.");
    } else {
        console.log(`Duplicate Items to delete: ${duplicateItems}`);
        for (duplicateItem of duplicateItems) {
            for (var i = 0; i < listOfItems.length; i++) {
                if (listOfItems[i].propertysuburbcode == duplicateItem) {
                    duplicateItemCodetoDelete = listOfItems[i]._id;
                    console.log(`Item ${duplicateItem} (Code: ${duplicateItemCodetoDelete}) to delete in Collection ${webflowCollection}`);
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
        console.log("Nothing to delete.");
        return;
    } else {
        console.log(`Items to delete: ${itemsToDelete}`);
        console.log(`Items to delete length: ${itemsToDelete.length}`);
        for (itemToDelete of itemsToDelete) {
            // console.log(`Next item to delete: ${itemToDelete}`);
            for (var i = 0; i < listOfItems.length; i++) {
                if (listOfItems[i].propertycode == itemToDelete) {
                    itemCodetoDelete = listOfItems[i]._id;
                    console.log(`Item ${itemToDelete} (Code: ${itemCodetoDelete}) to delete in Collection ${webflowCollection}`);
                    await deleteItem(webflowCollection, itemCodetoDelete, itemToDelete);
                } 
                // else {
                //     console.log(`Webflow property ${listOfItems[i].propertycode} not equal to item property code to delete: ${itemToDelete}`);
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
        console.log("Nothing to delete.");
        return;
    } else {
        console.log(`Suburb Items to delete: ${itemsToDelete}`);
        console.log(`Suburb Items to delete length: ${itemsToDelete.length}`);
        for (itemToDelete of itemsToDelete) {
            // console.log(`Next item to delete: ${itemToDelete}`);
            for (var i = 0; i < listOfItems.length; i++) {
                if (listOfItems[i].propertysuburbcode == itemToDelete) {
                    itemCodetoDelete = listOfItems[i]._id;
                    console.log(`Item ${itemToDelete} (Code: ${itemCodetoDelete}) to delete in Collection ${webflowCollection}`);
                    await deleteItem(webflowCollection, itemCodetoDelete, itemToDelete);
                } 
                // else {
                //     console.log(`Webflow property ${listOfItems[i].propertycode} not equal to item property code to delete: ${itemToDelete}`);
                // }
            }
        }
    }
}

// //Checking to see if there is anything inside webflow thats not inside Palace to delete
// function checkLiveItems(webflowCollection) {
//     // diff(): Returns an array with only the unique values from the first array, by
//     // excluding all values from additional arrays using strict equality for comparisons.
//     itemsToDelete = diff(uniqueWebflowPropertyCodesArray, uniquePalacePropertyCodesArray);
//     if (itemsToDelete.length == 0){
//         console.log("Nothing to delete.");
//         return;
//     } else {
//         console.log(`Items to delete: ${itemsToDelete}`);
//         console.log(`Items to delete length: ${itemsToDelete.length}`);
//         for (itemToDelete of itemsToDelete) {
//             console.log(`Next item to delete: ${itemToDelete}`);
//             for (var i = 0; i < listOfItems.length; i++) {
//                 if (listOfItems[i].propertycode == itemToDelete) {
//                     itemCodetoDelete = listOfItems[i]._id;
//                     console.log(`Item Code ${itemCodetoDelete} to delete in Collection ${webflowCollection}`);
//                     deleteItem(webflowCollection);
//                 } else {
//                     console.log(`Webflow property ${listOfItems[i].propertycode} not equal to item property code to delete: ${itemToDelete}`);
//                 }
//             }
//         }
//     }
// }

async function deleteItem(webflowCollectionId, itemCodetoDelete, itemNametoDelete) {
    try {
        webflow.removeItem({
            collectionId: webflowCollectionId,
            itemId: itemCodetoDelete
        });
        console.log(`Deleted item ${itemNametoDelete} from Collection ${webflowCollectionId}`);
    } catch {
        console.log(`Error - Problem deleting item ${itemNametoDelete} from Collection ${webflowCollectionId}: ${err}`);
    }
}

// async function deleteItem(webflowCollectionId) {
//     try {
//         const removedItem = await webflow.removeItem({
//             collectionId: webflowCollectionId,
//             itemId: itemCodetoDelete
//         });
//         console.log(`Deleted item ${itemToDelete} from Collection ${webflowCollectionId}`);
//     } catch (err) {
//         console.log(`Error - Problem deleting item: ${err}`); 
//     }
    
// }

async function createListings(createInWebflowCollection) {
    try {
        // console.log(`Palace Property Code to be imported: ${propertycode}`);
        // console.log(`Palace Property Image: ${propertyimageArray[0]}`);
        // console.log(`Palace Property Image Array: ${propertyimageArray}`);
        // console.log(`Palace Property Image Array Length: ${propertyimageArray.length}`);

        if (uniqueWebflowPropertyCodesArray.includes(propertycode)) { // ***** IMPLEMENT CONDITIONAL LOGIC to check if property is active. Import only if property is active! *****
            console.log("Property exists already - STOP");
            console.log("");
        } else {
            // Creates an array of image objects for the property image gallery
            function createJsonArray() {
                const jsonArray = [];

                propertyimageArray.forEach(el => {
                    string = '{ "url": "' + el + '" }';
                    obj = JSON.parse(string);
                    jsonArray.push(obj);
                });
                //console.log(jsonArray);
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
                    'propertyaddress3': propertyaddress4,
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
                    'propertybathroomsno': propertyfeaturesbathroomsno,
                    'propertybedroomsno': propertyfeaturesbedroomsno,
                    'propertydateavailable': propertydateavailableIsoDate,
                    'propertyheader': propertyfeaturesheader,
                    'propertyrentamount': propertyrentamount,
                    'propertystatus': propertystatus,
                    "propertysuburbdistrictorpostcode": propertysuburbtrademesuburbdistrictorpostcode,
                    "propertysuburbname": propertysuburbtrademesuburbname,
                    "propertysuburbregionorstate": propertysuburbtrademesuburbregionorstate,
                    '_archived': false,
                    '_draft': false,
                },
            });
            console.log(`Created item ${name} in collection ${createInWebflowCollection}`);
            console.log("");
        }
    } catch (err) {
        console.log(`Error - Problem creating listing: ${err}`); 
    }
}

async function createSuburb(createInWebflowCollection) {
    try {
        // console.log(`Palace Property Code to be imported: ${propertycode}`);
        // console.log(`Palace Property Image: ${propertyimageArray[0]}`);
        // console.log(`Palace Property Image Array: ${propertyimageArray}`);
        // console.log(`Palace Property Image Array Length: ${propertyimageArray.length}`);

        if (uniqueWebflowSuburbCodesArray.includes(propertysuburbtrademesuburbcode)) { // ***** IMPLEMENT CONDITIONAL LOGIC to check if property is active. Import only if property is active! *****
            console.log("Property exists already - STOP");
            console.log("");
        } else {
            webflow.createItem({
                collectionId: createInWebflowCollection,
                fields: {
                    'name': name,
                    // 'propertycode': propertycode,
                    // 'propertycodeglobal': propertycodeglobal,
                    // 'propertyunit': propertyunit,
                    // 'propertyaddress1': propertyaddress1,
                    // 'propertyaddress2': propertyaddress2,
                    // 'propertyaddress3': propertyaddress4,
                    // 'propertyaddress4': propertyaddress4,
                    // 'propertyimage': {
                    //     'url': propertyimageArray[0]
                    // },
                    // 'propertyimages': createJsonArray(),
                    // // [
                    //     // {
                    //     //     'url': 'http://images.getpalace.com/0e2c2606-1a59-4df7-b346-d20c7c153349/RBPI000021.jpg'
                    //     // },
                    //     // {
                    //     //     'url': "http://images.getpalace.com/0e2c2606-1a59-4df7-b346-d20c7c153349/RBPI000066.jpg"
                    //     // }
                    // // ],
                    // 'propertyadverttext': propertyfeaturesadverttext,
                    // 'propertyagentfullname': propertyagentfullname,
                    // 'propertyagentemail1': propertyagentemail1,
                    // 'propertyagentphonemobile': propertyagentphonemobile,
                    // 'propertyagentphonework': propertyagentphonework,
                    // 'propertybathroomsno': propertyfeaturesbathroomsno,
                    // 'propertybedroomsno': propertyfeaturesbedroomsno,
                    // 'propertydateavailable': propertydateavailableIsoDate,
                    // 'propertyheader': propertyfeaturesheader,
                    // 'propertyrentamount': propertyrentamount,
                    // 'propertystatus': propertystatus,
                    "propertysuburbcode": propertysuburbtrademesuburbcode,
                    "propertysuburbname": propertysuburbtrademesuburbname,
                    "propertysuburbdistrictorpostcode": propertysuburbtrademesuburbdistrictorpostcode,
                    "propertysuburbregionorstate": propertysuburbtrademesuburbregionorstate,
                    "propertysuburbtype": propertysuburbtrademesuburbtype,
                    '_archived': false,
                    '_draft': false,
                },
            });
            console.log(`Created suburb item ${name} in collection ${createInWebflowCollection}`);
            console.log("");
        }
    } catch (err) {
        console.log(`Error - Problem creating listing: ${err}`); 
    }
}

// Publishing data to process.env.WEBFLOW_DOMAIN
async function publishToSite() {
    webflow.publishSite({
        siteId: site_id,
        domains: [webflow_domain]
    })
    // .then(res => {
    //     console.log(`Published site to ${webflow_domain}!`);
    //   }); 
}

async function confirmPublishing() {
    console.log(`Published site to ${webflow_domain}!`);
}


async function fullUpload () {
    const palaceListings = await getPalaceListings();
    // await getPalaceSuburbs();
    // const publishedSite = await publishToSite();
    // await confirmPublishing(publishedSite);
}

fullUpload();

