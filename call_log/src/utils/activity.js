const activity = ({ name, data }) => {
  window.activityIsWorking = true;
  const appsActivity = new WebActivity(name, data);
  appsActivity
    .start()
    .then(() => {
      window.activityIsWorking = false;
      // success
    })
    .catch((error) => {
      window.activityIsWorking = false;
      console.error('App start error，error info：', error);
    });
};

export default activity;
