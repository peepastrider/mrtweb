async function loadCategory(category) {
  try {
      let response = await fetch(`../tuner-categories/${category}.html`);
      let categoryHTML = await response.text();
      const tuneInput = document.getElementById('tune-input');
      tuneInput.innerHTML = categoryHTML;
  } catch (error) {
      console.error("Error loading tuning category:", error);
  }
}

function stageSelect(number) {
  const cont = document.getElementById('stages-container');
  Array.from(cont.children).forEach(child => {
    if (child.innerHTML == number) {
      child.classList.add('selected-stage');
    }
    else {
      child.classList.remove('selected-stage');
    }
  });

  const desc = document.getElementById('stage-description');
  const x = JSON.parse(desc.getAttribute('data-values'));
  desc.innerHTML = `Stage ${number}: ${x[number]}% increase`;

  // TODO: update tune code
}