/**
 *
 *  NodeJS and npm for Libraries and frameworks
 *
 *  TOOLS!
 *      BABEL -> transforming ESNext to old ES5
 *          babel-core -> core functionality
 *          babel-preset-env -> Preset that takes care of modern JS
 *          babel-loader -> needed for webpack to load babel
 *          babel-polyfill -> needed to convert ES6 code not existant in ES5
 *      WebPack -> bundle ES6 modules (Module bundler)
 *          webpack -> package.json scripts
 *          webpack -> webpack.config.js for configuration
 *          webpack-cli package for executing
 *          webpack-dev-server for constant deployments
 *          html-webpack-plugin for uploading html to the dist folder
 *
 *  LOCALLY
 *      NPM -> init -> install XXX --save-dev (only for dev)
 *      NPM -> install XXX --save (to everyone)
 *      NPM -> uninstall XXX --save (to everyone)
 *      NPM -> install (installs all dependencies in the JSON file)
 *
 *  GLOBALLY
 *      NPM -> install live-server --global
 *
 *  MVC -> Model View Controller => MODEL (AJAX) // CONTROLLER (Puts it all together) // VIEW (UI CONTACT)
 */
/**
 *  Imports in ES6
 *  DEFAULT
 *     import string from './models/Search';
 *  NAMED
 *      import {add as a, multiply as m, ID} from "./models/Search";
 *      console.log(a(2,4));
 *      console.log(m(2,4));
 *      console.log(ID);
 *
 *      import * as search from './models/Search'
 *      console.log(search.add(1,2));
 */
/**
 *  Exports ES6
 *  Defaults -> export only 1 thing from the module
 *      export default 'I\'m the default';
 *  named -> multiple things in the export
 *      export const add = (a,b) => a + b;
 *      export const multiply = (a,b) => a * b;
 *      export const ID = 23;
 */
/**
 *  Axios
 *  fetch not recognized in old browsers so we'll user axios (install it from NPM
 *      Automatically return JSON
 *      Supported by all browsers
 *      Better error control
 */
/**
 *  Fractional
 */
/**
 *  Local Storage API
 *  It only saves string (JSON STRINGIFY)
 */
/**
 *  State of the APP
 *  current data and current variables, we want it in one place and one object
 *  Libraries like Redux on react do this
 */
import Favourite from './models/Favourite'
import Recipe from './models/Recipe'
import Search from './models/Search'
import ShoppingList from './models/ShoppingList'
import * as favouriteView from './views/favouriteView'
import * as recipeView from './views/recipeView'
import * as searchView from './views/searchView'
import * as shoppingListView from './views/shoppingListView'
import {DOM_ELEMENTS as Elements, clearLoader, renderLoader} from './views/base'

/**
 * Global state of the app
 *  - Search Object
 *  - Current recipe object
 *  - Shopping list object
 *  - Liked recipes
 */
const state = {};
window.addEventListener('load', () => {
    if (!state.favourite) state.favourite = new Favourite();
    if (!state.shoppingList) state.shoppingList = new ShoppingList();

    state.favourite.recoverData();
    state.shoppingList.recoverData();

    if (state.favourite.favourites.length > 0) {
        state.favourite.favourites.forEach(value => favouriteView.renderFavourite(value));
    }

    if (state.shoppingList.items.length > 0) {
        state.shoppingList.items.forEach(value => shoppingListView.renderShoppingListElement(value));
    }

    favouriteView.toggleLikeMenu(state.favourite.getNumberFavs());
    shoppingListView.toggleDeleteAllBtn(state.shoppingList.items.length);
});

const controlSearch = async () => {
      // 1 - Get Query from view
    const query = searchView.getInput();

    if (query) {
        // 2 - New search object and add to state
        state.search = new Search(query);

        // 3 - Prepare the UI for the new data
        searchView.cleanInput();
        searchView.cleanResultList();
        renderLoader(Elements.results);

        try {
            // 4 - Search for recipes
            await state.search.getSearchResults();

            // 5 - Render results in UI
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch (e) {
            alert(e);
            clearLoader();
        }
    }
};

const controlRecipe = async () => {
    // Gets ID and deletes #
    const id = window.location.hash.replace('#', '');
    console.log(id);

    if (id){
        // Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(Elements.recipe);

        // Highlight selected result
        if (state.search){
            searchView.cleanHighlighted();
            searchView.highlightSelected(id);
        }

        // Create new recipe object
        state.recipe = new Recipe(id);

        try {
            // Get recipe data
            await state.recipe.getFullRecipe();
            state.recipe.parseIngredients();

            // Calculate servings and times
            state.recipe.calcCookingTime();
            state.recipe.calcServings();

            // Render recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe);

            favouriteView.toggleLikeBtn(state.favourite.containsFav(id)!==-1);
        } catch (e) {
            alert(e);
        }
    }
};

const controlShoppingList = () => {
    if (!state.shoppingList) state.shoppingList = new ShoppingList();

    state.recipe.ingredients.forEach(value => {
        const item = state.shoppingList.addItem(value.count, value.unit, value.ingredient);
        console.log(item);
        shoppingListView.renderShoppingListElement(item);
    });

    shoppingListView.toggleDeleteAllBtn(state.shoppingList.items.length);
};

const controlFavourite = () => {
    if (!state.favourite) state.favourite = new Favourite();

    if (state.recipe) {
        const currentId = state.recipe.recipeId;

        console.log(state.favourite.containsFav(currentId));

        if (state.favourite.containsFav(currentId) === -1) {
            const favItem = state.favourite.addFav(state.recipe);
            favouriteView.renderFavourite(favItem);
        } else {
            state.favourite.deleteFav(currentId);
            favouriteView.deleteFavourite(currentId);
        }

        favouriteView.toggleLikeBtn(state.favourite.containsFav(currentId)!==-1);
    }

    favouriteView.toggleLikeMenu(state.favourite.getNumberFavs());
};

Elements.search.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

/*window.addEventListener('hashchange', controlRecipe);
window.addEventListener('load', controlRecipe);*/

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

/*Elements.results_list.addEventListener('click', async (e) => {
    console.log(e.target.closest('.results__link').href.split('#')[1]);
    state.recipe = new Recipe(e.target.closest('.results__link').href.split('#')[1]);
    await state.recipe.getFullRecipe();

    recipeView.renderRecipe(state.recipe.result);
});*/

Elements.shopping_list.addEventListener('click', event => {
    const id = event.target.closest('.shopping__item').dataset.itemid;

    if (event.target.matches('.shopping__delete *')) {
        state.shoppingList.deleteItem(id);
        shoppingListView.deleteListItem(id);
    }

    shoppingListView.toggleDeleteAllBtn(state.shoppingList.items.length);
});

Elements.shopping_list.addEventListener('change', event => {
    if (event.target.matches('.shopping__count *')) {
        state.shoppingList.updateItem(event.target.closest('li').dataset.itemid, parseFloat(event.target.value));
    }
});

Elements.shopping_delete_all.addEventListener('click', event => {
    if (event.target.matches('.shopping_delete_all_button *')) {
        state.shoppingList.deleteAll();
        shoppingListView.deleteAll();
        shoppingListView.toggleDeleteAllBtn(state.shoppingList.items.length);
    }
});

Elements.results_pages.addEventListener('click', event => {
    // closest ancestor of the current element (or the current element itself) which matches the selectors given in parameter.
    // If there isn't such an ancestor, it returns null
    const buttonElement = event.target.closest('.btn-inline');
    searchView.cleanResultList();
    //searchView.renderResults(state.search.result, parseInt(buttonElement.getAttribute('data-goto')));
    searchView.renderResults(state.search.result, parseInt(buttonElement.dataset.goto));
});

Elements.recipe.addEventListener('click', event => {
   if (event.target.matches('.btn-decrease-serving *')) {
       if (state.recipe.servings > 1) {
           state.recipe.updateServigs('dec');
           recipeView.updateServigsIngridients(state.recipe);
       }
   } else if (event.target.matches('.btn-increase-serving *')) {
       state.recipe.updateServigs('inc');
       recipeView.updateServigsIngridients(state.recipe);
   } else if (event.target.matches('.recipe__ingredients, .recipe__btn, .recipe__btn *')) {
       controlShoppingList();
   }  else if (event.target.matches('recipe__love, .recipe__love *')) {
        controlFavourite();
   }
});