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
  };