const core = require('@actions/core');
const github = require('@actions/github');
const PGYERAppUploader = require('./PGYERAppUploader');

try {
  const uploadOptions = {
    log: false,
  }

  const apiKey = core.getInput('_api_key', { required: true });
  if (!apiKey) {
    core.warning('apiKey was not set');
  }

  const appFilePath = core.getInput('appFilePath', { required: true });
  if (!appFilePath) {
    core.warning('appFilePath was not set');
  }
  uploadOptions.filePath = appFilePath;

  const otherParams = [
    "buildInstallType",
    "buildPassword",
    "buildUpdateDescription",
    "buildInstallDate",
    "buildInstallStartDate",
    "buildInstallEndDate",
    "buildChannelShortcut"
  ];

  otherParams.forEach(name => {
    let value = core.getInput(name);
    if (value) {
      uploadOptions[[name]] = value;
      core.info(`set ${name}: ${value}`);
    }
  });

  const ext = appFilePath.split('.').pop().toLowerCase();
  if (ext == 'ipa') {
    uploadOptions.buildType = 'ios';
  } else if (ext == 'apk') {
    uploadOptions.buildType = 'android';
  } else {
    core.warning(`Unsupported file type: ${ext}`);
  }

  core.info(`filePath: ${appFilePath}`);
  core.info(`buildType: ${uploadOptions.buildType}`);

  const uploader = new PGYERAppUploader(apiKey);
  uploader.upload(uploadOptions).then(function (info) {
    core.info(`upload success. app info:`);
    core.info(JSON.stringify(info));

    const infoData = info.data;
    core.setOutput('infoData', JSON.stringify(infoData));
    core.setOutput('buildKey', infoData.buildKey);
    core.setOutput('buildType', infoData.buildType);
    core.setOutput('buildIsFirst', infoData.buildIsFirst);
    core.setOutput('buildIsLastest', infoData.buildIsLastest);
    core.setOutput('buildFileKey', infoData.buildFileKey);
    core.setOutput('buildFileName', infoData.buildFileName);
    core.setOutput('buildFileSize', infoData.buildFileSize);
    core.setOutput('buildName', infoData.buildName);
    core.setOutput('buildVersion', infoData.buildVersion);
    core.setOutput('buildVersionNo', infoData.buildVersionNo);
    core.setOutput('buildBuildVersion', infoData.buildBuildVersion);
    core.setOutput('buildIdentifier', infoData.buildIdentifier);
    core.setOutput('buildIcon', infoData.buildIcon);
    core.setOutput('buildDescription', infoData.buildDescription);
    core.setOutput('buildUpdateDescription', infoData.buildUpdateDescription);
    core.setOutput('buildScreenshots', infoData.buildScreenshots);
    core.setOutput('buildShortcutUrl', infoData.buildShortcutUrl);
    core.setOutput('buildCreated', infoData.buildCreated);
    core.setOutput('buildUpdated', infoData.buildUpdated);
    core.setOutput('buildQRCodeURL', infoData.buildQRCodeURL);

    const buildUrl = "http://www.pgyer.com/"+info.data.buildShortcutUrl;
    core.setOutput("buildUrl", buildUrl);
  }).catch(console.error);

} catch (error) {
  core.setFailed(error.message);
}
