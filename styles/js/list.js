/* ==================================================================== */
/* Import Charadex
======================================================================= */
import { charadex } from './utilities.js';
import List from "https://esm.sh/gh/javve/list.js@v2.3.0";


/* ==================================================================== */
/* Build List
/* ====================================================================  /

  This is just an eaasy way to build a new list based on charadex
  You dont have to use it to build your own
    
======================================================================= */
charadex.buildList = (selector = 'charadex') => {

  let listConfig = {
    listClass: `${selector}-list`,
    item: `${selector}-gallery-item`,
  }
  
  /* Initialize Gallery
  ===================================================================== */
  const initializeGallery = (galleryArray, additionalListConfigs, gallerySelector) => {

    // Check if there's an array
    if (!charadex.tools.checkArray(galleryArray)) return false;

    // Create list classes
    listConfig.valueNames =  charadex.tools.createListClasses(galleryArray);
    
    // Create the List instance
    const galleryId = gallerySelector || `${selector}-gallery`;
    const listInstance = new List(galleryId, {...listConfig, ...additionalListConfigs}, galleryArray);

    // Helper to detect CW in an entry (checks common tag fields, arrays, and comma-separated strings)
    const isCW = (entry) => {
      if (!entry) return false;
      if (entry.cw === true) return true;
      const scrub = charadex.tools.scrub;
      for (let k in entry) {
        const v = entry[k];
        if (Array.isArray(v)) {
          if (v.map(i => scrub(i)).includes('cw')) return true;
        } else if (typeof v === 'string') {
          if (scrub(v) === 'cw') return true;
          if (v.split(',').map(i => scrub(i)).includes('cw')) return true;
        }
      }
      return false;
    };

    // Apply a blur to images for CW entries after rendering (uses listInstance.items)
    try {
      const applyBlurToItems = () => {
        listInstance.items.forEach((item, i) => {
          try {
            const values = item.values();
            if (isCW(values)) {
              const imgs = $(item.el).find('img');
              if (imgs && imgs.length) {
                imgs.addClass('cw-blur');
              } else {
                // Fallback 1: find image by exact src inside the gallery container
                try {
                  const container = $(`#${galleryId}`);
                  const imgsBySrc = container.find('img').filter(function() { return $(this).attr('src') == values.image; });
                  if (imgsBySrc.length) {
                    imgsBySrc.addClass('cw-blur');
                    return;
                  }
                } catch(e) { console.error(e); }

                // Fallback 2: find item by profileid text and then its image
                try {
                  const container = $(`#${galleryId}`);
                  const matchedItem = container.find(`.${listConfig.item}`).filter(function() {
                    return $(this).find('.profileid').text().trim() === String(values.profileid || values.profile || '');
                  }).first();
                  if (matchedItem.length) {
                    const imgs2 = matchedItem.find('img');
                    if (imgs2.length) {
                      imgs2.addClass('cw-blur');
                      return;
                    }
                  }
                } catch(e) { console.error(e); }

              }
            }
          } catch (err) {
            console.error('[charadex] initializeGallery: error checking item', err);
          }
        });
      };

      // Run once for the initial render and on updates (pagination/filters/etc.)
      setTimeout(applyBlurToItems, 250);
      listInstance.on('updated', applyBlurToItems);
    } catch (err) {
      console.error(err);
    }

    // Return the list instance
    return listInstance;

  };

  /* Attempt to get profile Array
  ===================================================================== */
  const getProfile = (galleryArray) => {


    // Check the parameters
    let pageParameter = charadex.url.getUrlParameters().get('profile');
    if (!pageParameter) return false;

    // Attempt to find the profile
    let profile = galleryArray.find((entry) => {
      return charadex.tools.scrub(entry.profileid) === charadex.tools.scrub(pageParameter)
    });

    // Return the profile in an array if it exists 
    return profile ? [profile] : false;
  
  };

  /* Initialize Profile
  ===================================================================== */
  const initializeProfile = (profileArray, profileSelector) => {

    // Check if there's an array
    if (!charadex.tools.checkArray(profileArray)) return false;

    // Create list classes & update the item name
    listConfig.valueNames =  charadex.tools.createListClasses(profileArray);
    listConfig.item = `${selector}-profile`;

    const galleryId = profileSelector || `${selector}-gallery`;
    const listInstance = new List(galleryId, listConfig, profileArray);

    // Detect CW for profile and blur its images
    try {
      const entry = profileArray[0];
      const scrub = charadex.tools.scrub;
      const isCW = (e) => {
        if (!e) return false;
        if (e.cw === true) return true;
        for (let k in e) {
          const v = e[k];
          if (Array.isArray(v)) {
            if (v.map(i => scrub(i)).includes('cw')) return true;
          } else if (typeof v === 'string') {
            if (scrub(v) === 'cw') return true;
            if (v.split(',').map(i => scrub(i)).includes('cw')) return true;
          }
        }
        return false;
      };

      if (isCW(entry)) {
        const applyBlurToProfile = () => {
          listInstance.items.forEach((item) => {
            try {
              const values = item.values();
              if (values && (values.profileid === entry.profileid || values.profileid === String(entry.profileid))) {
                const imgs = $(item.el).find('img');
                if (imgs && imgs.length) {
                  imgs.addClass('cw-blur');
                  $(item.el).addClass('cw-entry');
                } else {
                  // Fallback: try to find by image src within gallery
                  try {
                    const container = $(`#${galleryId}`);
                    const imgsBySrc = container.find('img').filter(function() { return $(this).attr('src') == entry.image; });
                    if (imgsBySrc.length) {
                      imgsBySrc.addClass('cw-blur');
                      imgsBySrc.closest(`.${listConfig.item}`).addClass('cw-entry');
                    }
                  } catch(e) { console.error(e); }

                }
              }
            } catch (err) {
              console.error('[charadex] initializeProfile: error applying blur', err);
            }
          });
        };
        setTimeout(applyBlurToProfile, 250);
        listInstance.on('updated', applyBlurToProfile);
      }
    } catch (err) {
      console.error(err);
    }

    return listInstance;

  };

  return {
    initializeGallery,
    getProfile,
    initializeProfile
  }

}


/* ==================================================================== */
/* Features
/* ====================================================================  /

  Different features for charadex - they're all compiled in the
  charadex.initialize function but you can use them seperately
  if you wish
    
======================================================================= */
charadex.listFeatures = {};

/* ==================================================================== */
/* Filters
======================================================================= */
charadex.listFeatures.filters = (parameters, selector = 'charadex') => {

  if (!parameters) return false;

  // Get selection
  const filterClass = `${selector}-filter`;
  const filtersElement = $(`#${filterClass}s`);
  const filterElement = $(`#${filterClass}`);

  const createFilters = () => {

    // Add filters
    for (let filter in parameters) {

      // Get the filter containers
      let newFilter = filterElement.clone();

      // Remove the id and add a special class
      newFilter
      .removeAttr('id')
      .addClass(filterClass);

      // Find the label and add the filter name
      newFilter
      .find('label')
      .text(filter);

      // Find the select and add the filter name & options
      let filterDOM = newFilter.find('select')
      .attr('name', charadex.tools.scrub(filter))
      .append(charadex.tools.createSelectOptions(parameters[filter]));

      // Add multiselect
      charadex.tools.addMultiselect(filterDOM);

      // Add to the filters container
      filtersElement.append(newFilter);

    }

    return true;

  } 

  // Create the filters when created;
  createFilters();

  const initializeFilters = (listJs) => {

    if (!listJs) return false;

    // Show the filters
    filtersElement.parents(`#${selector}-filter-container`).show();

    // Deal with the Dom
    $(`.${filterClass}`).each(function(el) {
      $(this).on('change', () => {

        // Get the key from the select name attr
        // And whatever the user selected
        let key = $(this).find('select').attr('name');
        let selection = $(this).find('option:selected').toArray().map(item => item.text);

        // Filter the list
        if (charadex.tools.checkArray(selection) && !selection.includes('All')) {
          listJs.filter((list) => {
            let values = list.values()[key];
            if (charadex.tools.checkArray(values)) {
              for (let val of values) return selection.includes(val);
            } else {
              return selection.includes(values);
            }
          });
        } else {
          listJs.filter();
        }

      });
    });
    
    // If they're in a container, hide it if there's nothing in it
    listJs.on('updated', (list) => {
      let listClass = $(`.${list.listClass}`);
      let listContainerSelector = `.${selector}-list-container`;
      if (list.matchingItems.length < 1 && listClass.length > 0) {
        listClass.parents(listContainerSelector).hide();
      } else {
        listClass.parents(listContainerSelector).show()
      }
    })

    return true;

  }

  return { initializeFilters }

}

/* ==================================================================== */
/* Faux Folders
======================================================================= */
charadex.listFeatures.fauxFolders = (pageUrl, folderParameters, selector = 'charadex') => {

  if (!pageUrl || !charadex.tools.checkArray(folderParameters) || !selector) return false;

  // Get the elements
  const folderElement = $(`#${selector}-folders`);

  // Loop through parameters and add them to the folder element
  for (let key of folderParameters) {
    const buttonElement = $(`#${selector}-folder`).clone();
    buttonElement.find('.btn')
      .text(key)
      .attr('href', charadex.url.addUrlParameters(pageUrl, { folder: key }));
    folderElement.append(buttonElement);
  }

  // Show the folders
  folderElement.parents(`#${selector}-folder-container`).show();

  // Return a lil thing that'll add folders to entries
  const addFolder = (entry, key) => {
    entry.folder = entry[charadex.tools.scrub(key)];
  };

  return addFolder;

}


/* ==================================================================== */
/* Pagination
======================================================================= */
charadex.listFeatures.pagination = (galleryArrayLength, pageAmount = 12, bottomPaginationToggle = true, selector = 'charadex') => {

  // Checks
  if (!pageAmount || !galleryArrayLength || !selector) return false;

  // You're safe to remove this if you want the pagination to show up even if its just one page
  if (galleryArrayLength <= pageAmount) return false;

  // Get our selectors
  const elementSelector = `${selector}-pagination`;
  const pagination = $(`.${elementSelector}`);

  // Create the buttons
  pagination.next().on('click', () => {
    const nextElement = $('.pagination .active').next().children('a')[0];
    if (nextElement) nextElement.click();
  });

  pagination.prev().on('click', () => {
    const prevElement = $('.pagination .active').prev().children('a')[0];
    if (prevElement) prevElement.click();
  });

  // Show the container
  pagination.parents(`.${selector}-pagination-container`).show();

  // Create the config
  let paginationConfig = {
    page: pageAmount,
    pagination: [
      {
        innerWindow: 1,
        left: 1,
        right: 1,
        item: `<li class='page-item'><a class='page page-link'></a></li>`,
        paginationClass: `${elementSelector}-top`,
      },
    ],
  }

  // If there needs to be a bottom one, set it up
  if (bottomPaginationToggle) paginationConfig.pagination.push(
    {
      innerWindow: 1,
      left: 1,
      right: 1,
      item: `<li class='page-item'><a class='page page-link'></a></li>`,
      paginationClass: `${elementSelector}-bottom`,
    },
  )

  return paginationConfig;

}


/* ==================================================================== */
/* Initialize Search
======================================================================= */
charadex.listFeatures.search = (searchParameters, searchFilterToggle = true, selector = 'charadex') => {

  // If there's no search parameters, abort
  if (!charadex.tools.checkArray(searchParameters)) return false;

  // Get our elements
  const searchElement = $(`#${selector}-search`);
  const searchFilter = $(`#${selector}-search-filter`);

  // Create
  const createSearch = () => {
    if (searchFilterToggle) {
      searchFilter.append(charadex.tools.createSelectOptions(searchParameters));
      searchFilter.parent().show();
    }
  }

  const initializeSearch = (listJs) => {

    if (!listJs) return false;
    
    // Else create the search
    createSearch();

    // Scrub the parameters
    searchParameters = searchParameters.map(i => charadex.tools.scrub(i));

    // Decide to use search filter or not when searching
    searchElement.on("keyup", () => {

      const selectedFilter = searchFilter.length > 0 ? searchFilter.val() : false;
      const searchString = searchElement.val();

      if (selectedFilter && selectedFilter !== 'all') {
        listJs.search(searchString, [charadex.tools.scrub(selectedFilter)]); // Search by the filter val
      } else {
        listJs.search(searchString, searchParameters); // Else search any of the parameters
      }

    });

    // Show search
    searchElement.parents(`#${selector}-search-container`).show();

  }

  return { initializeSearch };

}


/* ==================================================================== */
/* Prev Next Link
======================================================================= */
charadex.listFeatures.prevNextLink = function (pageUrl, galleryArray, profileArray, selector = 'charadex') {

  // Checks
  if (!charadex.tools.checkArray(galleryArray) || !charadex.tools.checkArray(profileArray) || !pageUrl) return false;

  // Will help us create links
  const updateLink = (selector, profile) => {
    const element = $(selector);
    if (profile) {
      element.attr('href', charadex.url.addUrlParameters(pageUrl, { profile: profile.profileid }));
      element.find('span').text(profile.profileid);
      element.show();
    } else {
      element.hide();
    }
  };

  // Check gallery index
  const currentIndex = galleryArray.findIndex((item) => item.profileid === profileArray[0].profileid);
  if (currentIndex === -1) return false;

  // Add links based on links
  updateLink('#entryPrev', galleryArray[currentIndex - 1] || null);
  updateLink('#entryNext', galleryArray[currentIndex + 1] || null);

  // Show the prevnext buttons
  $(`#${selector}-prevnext-container`).show();
  
  return true;

};


export { charadex, List };