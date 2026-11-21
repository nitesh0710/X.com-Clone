# Testimonials

Add entries to `testimonials.json` only with the client's written permission:

```json
[
  {
    "quote": "Exact words the client approved.",
    "name": "Jane Doe",
    "business": "Doe Plumbing",
    "town": "Dayton, OH",
    "verified": true,
    "permission_note": "Email from Jane, 2027-02-03, approving this quote and name."
  }
]
```

Nothing renders unless an entry has `verified: true`, a name, business, town and a permission note.
