// utils/carbonCalculator.js
module.exports = function calculate(userData) {
  const {
    transport_km,
    redMeat_per_week,
    fishMeat_per_week,
    whiteMeat_per_week,
    vegeMeat_per_week,
    veganMeat_per_week,
    electricity_kwh,
    typeCarburant,
    consommation,
    eau_type,
    chauffage_type,
    chauffage_conso
  } = userData;

  const redMeatMeal = 7.26; // cO2 en kg par kg de viande rouge
  const fishMeatMeal = 1.98; // cO2 en kg par kg de poisson
  const whiteMeatMeal = 1.58; // cO2 en kg par kg de viande blanche
  const vegeMeal = 0.51;
  const veganmeal = 0.39;

  const kwh = 0.06; //cO2 en kilo par kWh

  const redMeat = redMeat_per_week * (redMeatMeal); 
  const fishMeat = fishMeat_per_week * (fishMeatMeal); 
  const whiteMeat = whiteMeat_per_week * (whiteMeatMeal);
  const vegeMeat = vegeMeat_per_week * (vegeMeal);
  const veganMeat = veganMeat_per_week * (veganmeal);
  const electricity = (electricity_kwh/4.33) * kwh;

  // Vérification du total des repas
  const totalRepas =
    redMeat_per_week +
    fishMeat_per_week +
    whiteMeat_per_week +
    vegeMeat_per_week +
    veganMeat_per_week;

  if (totalRepas !== 14) {
    throw new Error("Le total des repas par semaine doit être exactement 14.");
  }

  // Calcul transport selon type de carburant
  let transport = 0;
  if (typeCarburant && typeCarburant !== "aucune" && consommation) {
    const facteursEmission = {
      essence: 2.31,       // kg CO2 / litre
      diesel: 2.61,        // kg CO2 / litre
      gpl: 1.65,           // kg CO2 / litre
      electrique: kwh      // kg CO2 / kWh (moyenne en France)
    };
    const facteur = facteursEmission[typeCarburant];
    if (facteur) {
      const consommationTotale = (consommation * transport_km) / 100;
      transport = consommationTotale * facteur;
    } else {
      throw new Error("Type de carburant non supporté.");
    }
  }

  // Calcul de l'empreinte liée à la consommation d'eau
  const eauLitreParSemaine = 1.5 * 7; // 1,5L/jour × 7 jours
  let eau = 0;
  if (eau_type === "bouteille") {
    eau = eauLitreParSemaine * 0.4; // 400g = 0.4kg CO2/L
  } else if (eau_type === "robinet") {
    eau = 0.01; // 0,1g = 0.0001kg CO2/L
  }

  // Calcul de l'empreinte liée au chauffage
  let chauffage = 0;
  if (chauffage_type && chauffage_conso && chauffage_type !== 'electricite') {
    // Facteurs d'émission moyens (kgCO2e/unité)
    const facteursChauffage = {
      bois: 200/12,        // stère/mois
      fioul: 2.7,       // kgCO2e/litre
      gaz: 0.227,        // kgCO2e/kWh
      reseau: 0.18,      // kgCO2e/kWh (valeur indicative)
      granule: 0.01,     // kgCO2e/kg
      pompe: 0.06        // kgCO2e/kWh (pompe à chaleur)
    };
    const facteur = facteursChauffage[chauffage_type];
    if (facteur) {
      chauffage = chauffage_conso * facteur / 4.33; // Conversion mensuel -> hebdo
    } else {
      throw new Error("Type de chauffage non supporté.");
    }
  }

  const total = transport + redMeat + fishMeat + whiteMeat + vegeMeat + veganMeat + electricity + eau + chauffage;

  return {
    total,
    details: { transport, redMeat, fishMeat, whiteMeat, vegeMeat, veganMeat, electricity, eau, chauffage }
  };
};
