/*
 * recipeaterbot
 * https://github.com/thomasrstorey/recipeater
 *
 * Copyright (c) 2015 Thomas R Storey
 * Licensed under the MIT license.
 */

'use strict';

function Recipeater () {
  var _ = require('lodash');
  var pd = require("probability-distributions");

  var self = {};
  var wares = require('./implements.js'),
     ings = require('./ingredients.js'),
     units = require('./units.js'),
     verbs = require('./verbs.js'),
     adverbs = require('./adverbs.js'),
     adjs = require('./adjectives.js');

  self.Kitchen = {
    ingredients : []
  };

  self.generateIngredientsList = function () {
    var numings = Math.ceil(_.sample(pd.rexp(150, 0.1)))+3;
    for(var i = 0; i != numings; i++) {
      self.Kitchen.ingredients.push(getIngredient());
    }
    return self.Kitchen.ingredients;
  };

  self.generateStepsList = function () {
    var numsteps = Math.ceil(_.sample(pd.rexp(150, 0.1)))+3;
    var steps = '';
    for (var i = 0; i != numsteps; i++){
      steps += generateSentence();
    }
    steps += "Serve " + _.sample(adjs) + ".";
    return steps;
  };

  var generateSentence = function () {
    var sentence = '';
    var fragments = {
      start : ["With a ${ tool }, ", "In a ${ ware }, ", ""],
      middle : [
        "${ verbs.first.present } the ${ ingredients.first.name } ",
        "${ adverb } ${ verbs.first.present } the ${ ingredients.first.name } ",
        "${ verbs.first.present } the ${ ingredients.first.name } and the ${ ingredients.second.name } together "
      ],
      end : ["until ${adjective}. ", "until ${verbs.second.past}. ", "for ${timerange} ${timeunit}. ", ". "]
    };

    var cookwares = wares.appliances.concat(wares.cookware);
    var start = _.template(_.sample(fragments.start));
    var middle = _.template(_.sample(fragments.middle));
    var end = _.template(_.sample(fragments.end));
    var components = {
      tool : _.sample(wares.tools),
      ware : _.sample(cookwares),
      verbs : {first: _.sample(_.sample(verbs)), second: _.sample(_.sample(verbs))},
      adverb : _.sample(adverbs),
      adjective : _.sample(adjs),
      ingredients : {first: _.sample(self.Kitchen.ingredients), second: _.sample(self.Kitchen.ingredients)},
      timerange : getTimeRange(),
      timeunit : _.sample(['femtoseconds', 'picoseconds', 'milliseconds', 'seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years', 'decades', 'centuries', 'eons'])
    };
    // console.dir(components.verb);
    sentence = start(components) + middle(components) + end(components);
    return sentence;
  }

  var getTimeRange = function(){
    var start = Math.ceil(_.sample(pd.rnorm(100, 10, 5)));
    var end = start + Math.ceil(_.sample(pd.rnorm(100, 5, 2)));
    return start + "-" + end;
  }

  self.writeIngredientList = function ( style ) {
    var out = '';
    var ilist = self.Kitchen.ingredients;
    if(style === "html"){

    } else if(style === 'md'){

    } else {
      // plaintext
      ilist.forEach(function(ingredient, index){
        var compiled = _.template(
          '${ quantity.num } ${ quantity.unit.abb } ${ name }, ${ state }\n'
        );
        out += compiled(ingredient);
      });
    }
    return out;
  };

  var getIngredient = function () {
    var ingredient = {};
    ingredient.type = _.sample(_.keys(ings));
    ingredient.name = _.sample(ings[ingredient.type]);
    ingredient.quantity = {
      unit: _.sample(units),
      num: Math.ceil(_.sample(pd.rexp(150, 0.1)))
    };
    ingredient.state = _.sample(adjs);
    return ingredient;
  };

  return self;
};

module.exports = Recipeater();
