import {
  clickButton,
  dropdownElements,
  dropdownSelect,
  fillInput,
  waitUntilElementFound,
} from '../../../helpers/elements-interactions';
import { navigateTo, waitForNavigation } from '../../../helpers/navigation';
import { BASE_URL, DATE_FORMAT } from '../definitions';

function getTransactionsUrl() {
  return `${BASE_URL}/ebanking/Accounts/ExtendedActivity.aspx?WidgetPar=1#/`;
}

/**
 *
 * @param page
 * @param callback (page, account: { accountName: string, accountValue: string }) => *
 * @returns {Promise<Array>}
 */
async function mapAccounts(page, callback) {
  const result = [];
  const url = getTransactionsUrl();
  await navigateTo(page, url);

  // Loop through all available accounts and collect transactions from all
  const accounts = await dropdownElements(page, 'select#ddlAccounts_m_ddl');
  for (const account of accounts) {
    // Skip "All accounts" option
    if (account.value !== '-1') {
      await dropdownSelect(page, 'select#ddlAccounts_m_ddl', account.value);
      await dropdownSelect(page, 'select#ddlTransactionPeriod', '001');
      await clickButton(page, 'input#btnDisplay');
      await waitForNavigation(page);

      result.push(await callback(page, { accountName: account.name, accountValue: account.value }));
    }
  }

  return result;
}

/**
 *
 * @param page
 * @param options { startDate: moment, accountValue: string }
 * @returns {Promise<*>}
 */
async function navigateToAccountTransactions(page, options) {
  await dropdownSelect(page, 'select#ddlAccounts_m_ddl', options.accountValue);
  await dropdownSelect(page, 'select#ddlTransactionPeriod', '004');
  await waitUntilElementFound(page, 'select#ddlTransactionPeriod');
  await fillInput(
    page,
    'input#dtFromDate_textBox',
    options.startDate.format(DATE_FORMAT),
  );
  await clickButton(page, 'input#btnDisplayDates');
  await waitForNavigation(page);

  await Promise.race([
    waitUntilElementFound(page, 'table#WorkSpaceBox table#ctlActivityTable', false),
    waitUntilElementFound(page, '.errInfo', false),
  ]);
}
export { mapAccounts, navigateToAccountTransactions, getTransactionsUrl };