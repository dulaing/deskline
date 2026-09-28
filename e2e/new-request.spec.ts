import {
  expect,
  test,
  type Page,
} from '@playwright/test';

import { expectFact, loginAs } from './helpers';

async function expectRequestFact(
  page: Page,
  label: string,
  value: string,
): Promise<void> {
  const factRow = page
    .locator('.request-facts > div')
    .filter({
      has: page.locator('dt').filter({
        hasText: new RegExp(`^${label}$`),
      }),
    });

  await expect(factRow.locator('dd')).toHaveText(value);
}

test(
  'a new request reaches the requester and the staff queue',
  async ({ page }) => {
    const title = `VPN drops ${Date.now()}`;
    const titleWithExtraSpaces = `  ${title}  `;

    const description =
      'The VPN disconnects every few minutes during video calls.';

    /*
     * Step 1: Log in as the requester.
     */
    await page.goto('/login');

    await loginAs(
      page,
      'requester@deskline.test',
    );

    await expect(page).toHaveURL(/\/my-requests$/);

    /*
     * Wait for an existing request.
     *
     * This confirms that My requests finished loading and
     * the request list is now in the React Query cache.
     */
    await expect(
      page.getByRole('link', {
        name: 'VPN disconnects repeatedly',
        exact: true,
      }),
    ).toBeVisible();

    /*
     * Step 2: Create a request.
     */
    const mainNavigation = page.getByRole('navigation', {
      name: 'Main navigation',
    });

    await mainNavigation
      .getByRole('link', {
        name: 'New request',
        exact: true,
      })
      .click();

    await expect(
      page.getByRole('heading', {
        name: 'Create a request',
      }),
    ).toBeVisible();

    await page
      .getByLabel('Title')
      .fill(titleWithExtraSpaces);

    await page
      .getByLabel('Description')
      .fill(description);

    await page
      .getByLabel('Category')
      .selectOption('software');

    await page
      .getByLabel('Priority')
      .selectOption('high');

    await page
      .getByRole('button', {
        name: 'Create request',
      })
      .click();

    /*
     * Step 3: Verify the request detail page.
     */
    await expect(page).toHaveURL(
      /\/requests\/request-[^/?#]+$/,
    );

    await expect(
      page.getByRole('heading', {
        name: title,
        exact: true,
      }),
    ).toBeVisible();

    await expectRequestFact(page, 'Status', 'open');
    await expectRequestFact(page, 'Priority', 'high');
    await expectRequestFact(page, 'Category', 'software');
    await expectRequestFact(
      page,
      'Requester',
      'Ravi Requester',
    );
    await expectRequestFact(
      page,
      'Assignee',
      'Unassigned',
    );

    const activity = page.getByRole('region', {
      name: 'Activity',
    });

    const firstMessage = activity
      .getByRole('listitem')
      .first();

    await expect(
      firstMessage.getByText('Ravi Requester', {
        exact: true,
      }),
    ).toBeVisible();

    await expect(
      firstMessage.getByText(description, {
        exact: true,
      }),
    ).toBeVisible();

    /*
     * Step 4: Return to the already-cached My requests list.
     */
    await page
      .getByRole('link', {
        name: 'Back to requests',
      })
      .click();

    await expect(page).toHaveURL(/\/my-requests$/);

    const matchingRequestLinks = page
      .getByRole('main')
      .getByRole('link', {
        name: title,
        exact: true,
      });

    // The request appears exactly once.
    await expect(matchingRequestLinks).toHaveCount(1);

    // The request is the first item in the list.
    const firstRequest = page
      .getByRole('main')
      .getByRole('listitem')
      .first();

    await expect(
      firstRequest.getByRole('link', {
        name: title,
        exact: true,
      }),
    ).toBeVisible();

    /*
     * Step 5: Change roles without reloading the page.
     */
    await page
      .getByRole('button', {
        name: 'Log out',
      })
      .click();

    await loginAs(
      page,
      'technician@deskline.test',
    );

    await expect(page).toHaveURL(/\/queue$/);

    await page
      .getByLabel('Assignee')
      .selectOption('unassigned');

    await expect(page).toHaveURL(
      /\/queue\?assignee=unassigned$/,
    );

    const queueRequest = page
      .getByRole('main')
      .getByRole('link', {
        name: title,
        exact: true,
      });

    await expect(queueRequest).toHaveCount(1);

    // The link's parent is the request list item.
    await expect(queueRequest.locator('..')).toContainText(
      'open',
    );
  },
);