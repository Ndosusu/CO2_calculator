// script.js
let carbonChart; // Pour garder une référence au graphique

// Ajoutez ce mapping en haut du fichier ou avant la boucle d'affichage des résultats
const labelsMap = {
  transport: "Transport",
  alimentation: "Alimentation",
  electricity: "Électricité",
  eau: "Eau",
  chauffage: "Chauffage"
};

document.getElementById('carbon-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    username: document.getElementById('username').value,
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

    document.getElementById('total').innerHTML =
      `Votre empreinte carbonne hebdomadaire est de ${result.total.toFixed(2)} kgCO₂e`;

    let rankElem = document.getElementById('classement');
    if (!rankElem) {
      rankElem = document.createElement('div');
      rankElem.id = 'classement';
      document.getElementById('results').insertBefore(rankElem, document.getElementById('details'));
    }
    if (result.rank && result.totalUsers) {
      document.getElementById('total').innerHTML +=
        `<br>Vous êtes classé(e) ${result.rank}${result.rank === 1 ? 'er' : 'ème'} sur ${result.totalUsers} utilisateur(s)`;
    } else {
      rankElem.textContent = '';
    }

    const detailsList = document.getElementById('details');
    document.getElementById('conclusion').textContent = `... mais ce calculateur ne prend pas en compte l'empreinte de votre logement, de vos appareils électroniques, de vos vêtements, de vos voyages en avion, etc.`;
    detailsList.innerHTML = '';

    for (const [key, value] of Object.entries(result.details)) {
      // Regroupement alimentation
      if (key === "redMeat") {
        // Additionne toutes les catégories alimentaires
        const alimentation =
          result.details.redMeat +
          result.details.fishMeat +
          result.details.whiteMeat +
          result.details.vegeMeat +
          result.details.veganMeat;
        const li = document.createElement('li');
        li.setAttribute('data-key', 'alimentation');
        li.setAttribute('class', 'alimentation-toggle');
        li.style.cursor = 'pointer';
        li.innerHTML = `${labelsMap["alimentation"]} : ${alimentation.toFixed(2)} kgCO₂e <span class="toggle-arrow" style="font-size:0.9em;color:#388e3c;">&#x25BC;</span>`;

        // Sous-liste cachée par défaut
        const subList = document.createElement('ul');
        subList.style.display = 'none';
        subList.style.margin = '0.5em 0 0 1.5em';
        subList.style.padding = '0';
        subList.style.listStyle = 'none';

        const aliments = [
          { key: 'redMeat', label: 'Viande rouge' },
          { key: 'fishMeat', label: 'Poisson' },
          { key: 'whiteMeat', label: 'Viande blanche' },
          { key: 'vegeMeat', label: 'Végétarien' },
          { key: 'veganMeat', label: 'Végétalien' }
        ];
        aliments.forEach(a => {
          const subLi = document.createElement('li');
          subLi.textContent = `${a.label} : ${result.details[a.key].toFixed(2)} kgCO₂e`;
          subLi.style.background = "#f1f8e9";
          subLi.style.borderRadius = "5px";
          subLi.style.margin = "0.2em 0";
          subLi.style.padding = "0.3em 0.8em";
          subList.appendChild(subLi);
        });

        li.appendChild(subList);

        li.addEventListener('click', function (e) {
          subList.style.display = subList.style.display === 'none' ? '' : 'none';
          li.querySelector('.toggle-arrow').innerHTML = subList.style.display === 'none' ? '&#x25BC;' : '&#x25B2;';
        });

        detailsList.appendChild(li);
      }
      // N'affiche pas les autres catégories alimentaires individuellement
      if (
        ["fishMeat", "whiteMeat", "vegeMeat", "veganMeat"].includes(key)
      ) continue;
      // Affiche les autres catégories normalement
      if (!["redMeat", "fishMeat", "whiteMeat", "vegeMeat", "veganMeat"].includes(key)) {
        const li = document.createElement('li');
        li.setAttribute('data-key', key);
        li.textContent = `${labelsMap[key] || key} : ${value.toFixed(2)} kgCO₂e`;
        detailsList.appendChild(li);
      }
    }

    // Ajoutez ce bloc après la boucle d'affichage des détails
    if (result.user_id && result.id) {
      fetch(`http://localhost:3000/api/carbon/category-rank?user_id=${result.user_id}&result_id=${result.id}`)
        .then(r => r.json())
        .then(ranks => {
          // Ajoute le classement à chaque ligne
          Array.from(detailsList.children).forEach((li) => {
            const key = li.getAttribute('data-key');
            const rankInfo = ranks[key];
            if (rankInfo) {
              // Crée un span pour le rang
              const rankSpan = document.createElement('span');
              rankSpan.style.color = "#388e3c";
              rankSpan.style.fontSize = "0.95em";
              rankSpan.textContent = ` (rang : ${rankInfo.rank}/${rankInfo.total})`;
              li.appendChild(rankSpan);

              // Calcul du pourcentage de classement
              const percent = rankInfo.rank / rankInfo.total;
              // Choix de la couleur selon le pourcentage
              let bg;
              if (percent <= 0.2) bg = "#a5d6a7";         // top 20% : vert clair
              else if (percent <= 0.4) bg = "#c8e6c9";    // 20-40%
              else if (percent <= 0.6) bg = "#fff9c4";    // 40-60% : jaune pâle
              else if (percent <= 0.8) bg = "#ffe082";    // 60-80% : jaune/orange
              else bg = "#ffab91";                        // 80-100% : orange/rouge
              li.style.backgroundColor = bg;
            }
          });
        });
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

document.getElementById('typeCarburant').addEventListener('change', function() {
  const vehiculeDetails = document.getElementById('vehicule-details');
  if (this.value === 'aucune') {
    vehiculeDetails.style.display = 'none';
    // Désactive les champs pour éviter les erreurs de validation
    vehiculeDetails.querySelectorAll('input').forEach(input => {
      input.required = false;
      input.value = '';
    });
  } else {
    vehiculeDetails.style.display = '';
    vehiculeDetails.querySelectorAll('input').forEach(input => {
      input.required = true;
    });
  }
});
