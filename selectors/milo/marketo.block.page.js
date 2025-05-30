import { expect } from '@playwright/test';

const FIRST_NAME = 'firstNameTest';
const LAST_NAME = 'lastNameTest';
const PHONE = '415-123-4567';
const EMAIL = 'test@adobetest.com';
const COMPANY = 'Adobe';
const POSTAL_CODE = '94111';

export default class Marketo {
  constructor(page) {
    this.page = page;
    this.marketo = this.page.locator('.marketo');
    this.firstName = this.marketo.locator('input[name="FirstName"]');
    this.lastName = this.marketo.locator('input[name="LastName"]');
    this.email = this.marketo.locator('input[name="Email"]');
    this.phone = this.marketo.locator('input[name="Phone"]');
    this.company = this.marketo.locator('input[name="mktoFormsCompany"]');
    this.functionalArea = this.marketo.locator(
      'select[name="mktoFormsFunctionalArea"]',
    );
    this.country = this.marketo.locator('select[name="Country"]');
    this.state = this.marketo.locator('select[name="State"]');
    this.postalCode = this.marketo.locator('input[name="PostalCode"]');
    this.jobTitle = this.marketo.locator('select[name="mktoFormsJobTitle"]');
    this.primaryProductInterest = this.marketo.locator(
      'select[name="mktoFormsPrimaryProductInterest"]',
    );
    this.companyType = this.marketo.locator(
      'select[name="mktoFormsCompanyType"]',
    );
    this.submitButton = this.marketo.locator('#mktoButton_new');
    this.message = this.marketo.locator('.ty-message');
    this.title = this.marketo.locator('.marketo-title');
    this.description = this.marketo.locator('.marketo-description');
    this.errorMessage = this.marketo.locator('.msg-error > .mktoVisible  > div > div > div > div.mktoHtmlText');
  }

  async submitFullTemplateForm(poi) {
    await this.country.selectOption({ index: 1 });
    await this.jobTitle.selectOption({ index: 1 });
    await this.company.fill(COMPANY);
    await this.firstName.fill(FIRST_NAME);
    await this.lastName.fill(LAST_NAME);
    await this.email.fill(EMAIL);
    await this.phone.fill(PHONE);
    await this.functionalArea.selectOption({ index: 1 });
    await this.postalCode.fill(POSTAL_CODE);

    // Setting index 2 to test so that the 'Company Type' field doesn't display
    await this.primaryProductInterest.selectOption(
      poi !== undefined ? poi : { index: 2 },
    );

    await this.state.selectOption({ index: 1 });
    await this.selectCompanyType();
    await this.submitButton.click();
  }

  async submitExpandedTemplateForm() {
    await this.country.selectOption({ index: 1 });
    await this.jobTitle.selectOption({ index: 1 });
    await this.firstName.fill(FIRST_NAME);
    await this.lastName.fill(LAST_NAME);
    await this.email.fill(EMAIL);
    await this.functionalArea.selectOption({ index: 1 });
    await this.company.fill(COMPANY);
    await this.selectCompanyType();
    await this.submitButton.click();
  }

  async submitEssentialTemplateForm() {
    await this.country.selectOption({ index: 1 });
    await this.firstName.fill(FIRST_NAME);
    await this.lastName.fill(LAST_NAME);
    await this.email.fill(EMAIL);
    await this.company.fill(COMPANY);
    await this.selectCompanyType();
    await this.submitButton.click();
  }

  async getPOI() {
    const poi = await this.page.evaluate(
      'window.mcz_marketoForm_pref.program.poi',
    );
    return poi;
  }

  async getFormTemplate() {
    const template = await this.page.evaluate(
      'window.mcz_marketoForm_pref.form.template',
    );

    if (!template) {
      throw new Error('Template not found');
    }

    return template;
  }

  async selectCompanyType() {
    // The company type field will display if the poi is one of the below
    const expectedPOI = ['Commerce', 'ADOBEADVERTISINGCLOUD'];

    if (expectedPOI.includes(await this.getPOI())) {
      this.companyType.selectOption({ index: 1 });
    }
  }

  /**
   * @description Checks that the input fields have the placeholder attribute
   * and that the value isn't empty.
   */
  async checkInputPlaceholders() {
    const template = await this.getFormTemplate();

    const inputFields = [
      this.firstName,
      this.lastName,
      this.email,
      this.company,
    ];

    if (template === 'flex_contact') inputFields.push(this.phone, this.postalCode);

    inputFields.forEach(async (field) => {
      await expect(async () => {
        expect(await field).toHaveAttribute('placeholder', { timeout: 10000 });
        const placeholder = await field.getAttribute('placeholder');
        expect(placeholder.length).toBeGreaterThan(1);
      }).toPass();
    });
  }

  async checkForErrorMessages() {
    const template = await this.getFormTemplate();

    const inputFields = [
      this.firstName,
      this.lastName,
      this.email,
      this.company,
      this.country,
    ];

    if (template === 'flex_contact') {
      inputFields.push(
        this.phone,
        this.postalCode,
        this.jobTitle,
        this.functionalArea,
        this.primaryProductInterest,
      );
    } else if (template === 'flex_event') {
      inputFields.push(
        this.jobTitle,
        this.functionalArea,
      );
    }

    inputFields.forEach(async (field) => {
      await expect(async () => {
        await expect(field).toHaveCSS('border-top-color', 'rgb(215, 55, 63)');
        await expect(field).toHaveCSS('border-left-color', 'rgb(215, 55, 63)');
        await expect(field).toHaveCSS('border-right-color', 'rgb(215, 55, 63)');
        await expect(field).toHaveCSS('border-bottom-color', 'rgb(215, 55, 63)');
      }).toPass();
    });

    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toHaveCSS('color', 'rgb(215, 55, 63)');
    await expect(this.errorMessage).toHaveText('This field is required..');
  }

  async formElements() {
    const template = await this.getFormTemplate();

    const elements = [
      this.firstName,
      this.lastName,
      this.email,
      this.company,
      this.country,
      this.companyType,
      this.submitButton,
      this.title,
      this.description,
    ];

    if (template === 'flex_event') {
      elements.push(this.jobTitle, this.functionalArea);
    } else if (template === 'flex_contact') {
      elements.push(
        this.phone,
        this.jobTitle,
        this.functionalArea,
        this.state,
        this.postalCode,
        this.primaryProductInterest,
      );
    }

    return elements;
  }
}
