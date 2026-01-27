module.exports = {
  extends: ['@commitlint/config-conventional'],
  plugins: [
    {
      rules: {
        'smart-ticket-validation': ({ subject }) => {
          if (!subject) return [true];

          if (!subject.startsWith('[')) {
            return [
              false,
              `Subject must start with an opening bracket '['. Found: "${subject.substring(
                0,
                3,
              )}..."`,
            ];
          }

          const closingBracketIndex = subject.indexOf(']');
          if (closingBracketIndex === -1) {
            return [
              false,
              `Ticket ID must be enclosed in brackets (missing closing ']'). Found: "${subject}"`,
            ];
          }

          const ticketPart = subject.substring(0, closingBracketIndex + 1);
          const remainingPart = subject.substring(closingBracketIndex + 1);

          const ticketContentRegex = /^\[PNV-[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*\]$/;
          if (!ticketContentRegex.test(ticketPart)) {
            return [
              false,
              `Invalid Ticket ID format inside brackets. Expected uppercase & number (e.g., [PNV-1], [PNV-1-dev]). Found: "${ticketPart}"`,
            ];
          }

          if (!remainingPart.startsWith(' ')) {
            return [
              false,
              `Missing whitespace after Ticket ID. Expected: "${ticketPart} Message". Found: "${ticketPart}${remainingPart.substring(
                0,
                5,
              )}..."`,
            ];
          }

          if (remainingPart.startsWith('  ')) {
            return [
              false,
              'Too many spaces after Ticket ID. Use exactly one space. Found multiple.',
            ];
          }

          return [true];
        },
      },
    },
  ],
  rules: {
    'smart-ticket-validation': [2, 'always'],
  },
};
