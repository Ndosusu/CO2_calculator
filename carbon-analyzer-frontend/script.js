// script.js
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
    consommation: parseFloat(e.target.consommation.value)
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

    document.getElementById('total').textContent = `Votre empreinte carbonne hebdomadaire est de ${result.total.toFixed(2)} kgCO₂e`;
    const detailsList = document.getElementById('details');
    detailsList.innerHTML = '';

    for (const [key, value] of Object.entries(result.details)) {
      const li = document.createElement('li');
      li.textContent = `${key} : ${value.toFixed(2)} kgCO₂e`;
      detailsList.appendChild(li);
    }

    document.getElementById('results').style.display = 'block';
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
