/* eslint-disable no-restricted-syntax */
/* eslint-disable import/named */
import { test } from '@playwright/test';
import { features } from '../../../features/visual/graybox/sot.dc.spec.js';
import { takeTwo } from '../../../libs/screenshot/take.js';
import { writeResultsToFile } from '../../../libs/screenshot/utils.js';
import Visual from '../../../selectors/visual/visual.page.js';

const { WebUtil } = require('../../../libs/webutil.js');

const folderPath = 'screenshots/graybox-dc';
const results = {};

test.describe('Graybox DC SOT visual comparison test suite', () => {
  // reset timeout because we use this to run all test data
  test.setTimeout(20 * 60 * 1000);
  for (const feature of features) {
    // eslint-disable-next-line no-loop-func
    test(`${feature.name},${feature.tags}`, async ({ page }, testInfo) => {
      // load test data from static files
      const testdata = await WebUtil.loadTestData(`${feature.data}`);

      const visual = new Visual(page);

      for (const key of Object.keys(testdata)) {
        const stableURL = testdata[key];
        console.info(stableURL);
        const betaURL = testdata[key].replace('www.stage', 'test.graybox');
        console.info(betaURL);

        const name = `${feature.name}-${key}-${testInfo.project.name}`;
        // eslint-disable-next-line no-await-in-loop
        const result = await takeTwo(
          page,
          stableURL,
          async () => { await visual.waitForEndOfPage(); },
          betaURL,
          async () => { await visual.waitForEndOfPage(); },
          folderPath,
          name,
          { fullPage: true },
        );
        results[name] = [result];
      }
      writeResultsToFile(folderPath, testInfo, results);
    });
  }
});
