// script.js
let carbonChart; // Pour garder une référence au graphique

// Ajoutez ce mapping en haut du fichier ou avant la boucle d'affichage des résultats
const labelsMap = {
  transport: "Transport",
  redMeat: "Repas viande rouge",
  fishMeat: "Repas poisson",
  whiteMeat: "Repas viande blanche",
  vegeMeat: "Repas végétarien",
  veganMeat: "Repas vegan",
  electricity: "Électricité",
  eau: "Eau",
  chauffage: "Chauffage"
};

document.getElementById('carbon-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    transport_km: parseFloat(e.target.transport_km.value),
    redMeat_per_week: parseFloat(e.target.redMeat_per_week.value),
    fishMeat_per_week: parseFloat(e.target.fishMeat_per_week.value),
    whiteMeat_per_week: parseFloat(e.target.whiteMeat_per_week.value),
    vegeMeat_per_week: parseFloat(e.target.vegeMeat_per_week.value),
    veganMeat_per_week: parseFloat(e.target.veganMeat_per_week.value),
    eau_type: e.target.eau_type.value,
    electricity_kwh: parseFloat(e.target.electricity_kwh.value),
    typeCarburant: e.target.typeCarburant.value,
    consommation: parseFloat(e.target.consommation.value),
    chauffage_type: document.getElementById('chauffage_type').value,
    chauffage_conso: (() => {
      const input = document.getElementById('chauffage_conso');
      return input ? parseFloat(input.value) : null;
    })()
  };

  const totalRepas =
    data.redMeat_per_week +
    data.fishMeat_per_week +
    data.whiteMeat_per_week +
    data.vegeMeat_per_week +
    data.veganMeat_per_week;

  if (totalRepas !== 14) {
    alert("Le total des repas par semaine doit être exactement 14.");
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/carbon/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    document.getElementById('total').textContent = `Votre empreinte carbonne hebdomadaire est de ... ${result.total.toFixed(2)} kgCO₂e`;
    const detailsList = document.getElementById('details');
    document.getElementById('conclusion').textContent = `... mais ce calculateur ne prend pas en compte l'empreinte de votre logement, de vos appareils électroniques, de vos vêtements, de vos voyages en avion, etc.`;
    detailsList.innerHTML = '';

    for (const [key, value] of Object.entries(result.details)) {
      const li = document.createElement('li');
      // Utilisez le mapping pour afficher le label lisible
      li.textContent = `${labelsMap[key] || key} : ${value.toFixed(2)} kgCO₂e`;
      detailsList.appendChild(li);
    }

    document.getElementById('results').style.display = 'block'; // Affiche d'abord la div des résultats

    // Scroll vers la section résultat
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });

    // Affichage du graphique circulaire
    const ctx = document.getElementById('carbonPie').getContext('2d');
    const labels = Object.keys(result.details);
    const dataValues = Object.values(result.details);

    if (carbonChart) carbonChart.destroy(); // Détruit l'ancien graphique si besoin

    carbonChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: dataValues,
          backgroundColor: [
            '#388e3c', '#81c784', '#43a047', '#c8e6c9', '#a5d6a7', '#66bb6a', '#bdbdbd', '#e8f5e9'
          ]
        }]
      },
      options: {
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  } catch (error) {
    console.error('Erreur :', error);
    alert("Une erreur est survenue lors du calcul.");
  }
});

function updateRepasRestants() {
  const red = parseInt(document.querySelector('[name="redMeat_per_week"]').value) || 0;
  const white = parseInt(document.querySelector('[name="whiteMeat_per_week"]').value) || 0;
  const fish = parseInt(document.querySelector('[name="fishMeat_per_week"]').value) || 0;
  const vege = parseInt(document.querySelector('[name="vegeMeat_per_week"]').value) || 0;
  const vegan = parseInt(document.querySelector('[name="veganMeat_per_week"]').value) || 0;
  const total = red + white + fish + vege + vegan;
  const restant = 14 - total;
  document.getElementById('repas-restants').textContent = `Repas restants : ${restant}`;
}

// Ajoute l'écouteur sur tous les champs de repas
['redMeat_per_week','whiteMeat_per_week','fishMeat_per_week','vegeMeat_per_week','veganMeat_per_week'].forEach(name => {
  document.querySelector(`[name="${name}"]`).addEventListener('input', updateRepasRestants);
});

// Initialisation au chargement
updateRepasRestants();

const chauffageTypeSelect = document.getElementById('chauffage_type');
const chauffageInputsDiv = document.getElementById('chauffage-inputs');

const labels = {
  bois: 'Consommation de bois (stère/année) :',
  electricite: 'déjà prise en compte',
  fioul: 'Consommation de fioul (litres/mois) :',
  gaz: 'Consommation de gaz (kWh/mois) :',
  reseau: 'Consommation réseau de chaleur (kWh/mois) :',
  granule: 'Consommation de granulé (kg/mois) :',
  pompe: 'Consommation pompe à chaleur (kWh/mois) :'
};

chauffageTypeSelect.addEventListener('change', function() {
  const type = chauffageTypeSelect.value;
  if (type === 'electricite') {
    chauffageInputsDiv.innerHTML = `<input type="hidden" name="chauffage_conso" id="chauffage_conso" value="0"> <span>déjà prise en compte</span>`;
  } else {
    chauffageInputsDiv.innerHTML = `
      <label>${labels[type]}
        <input type="number" name="chauffage_conso" id="chauffage_conso" required>
      </label>
    `;
  }
});
