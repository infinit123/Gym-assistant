const ProfileModule = (() => {
  const form = document.getElementById('profile-form');

  const loadData = () => {
    const data = Storage.getProfile();
    document.getElementById('prof-age').value = data.age || '';
    document.getElementById('prof-sex').value = data.sex || 'male';
    document.getElementById('prof-height').value = data.height || '';
    document.getElementById('prof-experience').value = data.experience || 'intermediate';
    document.getElementById('prof-days').value = data.trainingDays || 4;
  };

  const bindEvents = () => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const updated = {
        age: parseInt(document.getElementById('prof-age').value),
        sex: document.getElementById('prof-sex').value,
        height: parseInt(document.getElementById('prof-height').value),
        experience: document.getElementById('prof-experience').value,
        trainingDays: parseInt(document.getElementById('prof-days').value)
      };
      Storage.setProfile(updated);
      DashboardModule.render();
      alert('Profil salvat cu succes!');
    });
  };

  return {
    init: () => { loadData(); bindEvents(); },
    loadData
  };
})();
