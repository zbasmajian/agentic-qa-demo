# Feature: Free Shipping on Orders Over $100

## Summary

Orders with a qualifying subtotal **over $100.00** get free standard shipping. Orders at or below $100.00 pay the normal shipping rate. The cart and checkout show the customer whether they qualify, and if not, how much more they need to spend.

## Business Rules

| # | Rule |
|---|------|
| BR-1 | The qualifying subtotal is the sum of item prices × quantities, **after** item- and order-level discounts and **before** tax and shipping. |
| BR-2 | Free shipping applies only when the qualifying subtotal is **strictly greater than $100.00**. Exactly $100.00 does **not** qualify. |
| BR-3 | Free shipping applies to the **standard** shipping method only. Expedited and overnight methods keep their normal price. |
| BR-4 | Gift cards, gift-card purchases and store credit do not count toward the qualifying subtotal. |
| BR-5 | Eligibility is recalculated whenever the cart changes (add, remove, quantity change, coupon applied or removed). |
| BR-6 | Amounts are compared in cents to avoid rounding errors (e.g. `10001 > 10000`). |

## User Stories

- **As a shopper**, I want to see how close I am to free shipping so I can decide whether to add more items.
- **As a shopper**, I want free shipping applied automatically when I qualify, without entering a code.
- **As the business**, I want the threshold to apply to the discounted subtotal so that coupons can't be stacked to get free shipping below $100 of actual spend.

## UI Requirements

1. **Cart page and mini-cart**
   - Below threshold: show a message such as *"Add $X.XX more to get free shipping."*, where X.XX = $100.01 − qualifying subtotal.
   - At or above the threshold: show *"You've unlocked free shipping!"*
   - Optional: a progress bar toward the threshold. It needs an accessible label, e.g. `role="progressbar"` with `aria-valuenow`.
2. **Checkout – shipping step**
   - When the order qualifies, the Standard shipping option shows **Free** (with the regular price struck through).
   - The order summary shows `Shipping: $0.00`.
3. **Order confirmation and email** show shipping as `$0.00 (Free shipping)`.

## Acceptance Criteria

```gherkin
Feature: Free shipping on orders over $100

  Background:
    Given the standard shipping rate is $7.99
    And the free shipping threshold is $100.00

  Scenario: Order over $100 ships free
    Given my cart subtotal is $100.01
    When I go to checkout and choose Standard shipping
    Then the shipping cost is $0.00
    And the order total equals the subtotal plus tax

  Scenario: Order of exactly $100 pays shipping (boundary)
    Given my cart subtotal is $100.00
    When I go to checkout and choose Standard shipping
    Then the shipping cost is $7.99
    And I see "Add $0.01 more to get free shipping."

  Scenario: Order under $100 pays shipping
    Given my cart subtotal is $99.99
    When I view my cart
    Then I see "Add $0.02 more to get free shipping."
    And Standard shipping costs $7.99 at checkout

  Scenario: Coupon drops the subtotal below the threshold
    Given my cart subtotal is $110.00
    When I apply a coupon for $15.00 off
    Then the qualifying subtotal is $95.00
    And free shipping is no longer applied
    And I see "Add $5.01 more to get free shipping."

  Scenario: Removing an item revokes free shipping
    Given my cart subtotal is $120.00 and I qualify for free shipping
    When I remove an item priced $30.00
    Then the qualifying subtotal is $90.00
    And free shipping is no longer applied

  Scenario: Increasing quantity unlocks free shipping
    Given my cart has 1 item priced $60.00
    When I change the quantity to 2
    Then the subtotal is $120.00
    And I see "You've unlocked free shipping!"

  Scenario: Expedited shipping is not free
    Given my cart subtotal is $150.00
    When I choose Expedited shipping
    Then the expedited shipping rate is charged

  Scenario: Gift cards do not count toward the threshold
    Given my cart has a $50.00 gift card and $60.00 of merchandise
    When I view my cart
    Then the qualifying subtotal is $60.00
    And free shipping is not applied

  Scenario: Tax does not count toward the threshold
    Given my cart subtotal is $95.00 and tax is $8.00
    When I go to checkout
    Then free shipping is not applied
```

## Test Notes

- **Boundary values:** $99.99, $100.00, $100.01. Also check a multi-item cart that sums to exactly $100.00 (e.g. 3 × $33.33 + $0.01) to catch floating-point issues.
- **Re-evaluation:** test that eligibility updates live in the cart and is re-checked on the server when the order is placed, so a stale client can't get free shipping.
- **Accessibility:** the threshold message should be announced when it changes, e.g. through an `aria-live="polite"` region.

## Out of Scope

- International or non-standard shipping zones
- Membership or loyalty free-shipping programs
- Changing the threshold per region or currency

## Open Questions

1. Should exactly $100.00 qualify? This spec reads "over $100" as strictly greater (BR-2). Confirm with the product owner.
2. Is the threshold calculated before or after discounts? This spec assumes after (BR-1).
3. If an order that qualified for free shipping is partly returned and drops below $100, is shipping charged back?
4. Does the threshold need to be configurable (admin setting or env var), or is it hard-coded?
