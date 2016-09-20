Zoho Connector
==============

Do you want a form to POST to Zoho CRM, but don't want to send the api key to
the client and let him wreack havok with your data? Enter Zoho Connector.
Just deploy it to your Dokku/Heroku server, and configure it using only
ENV vars. No need to code!


Configuration
-------------

The following ENV vars are available:
- `ZOHO_API_KEY`: The API key to Zoho CRM. Required.
- `PORT`: The port to listen on. Defaults to 3000.


API call
--------

This server has only a single api call, which is a POST to the root folder.
The body can be either a JSON body, or a regular form.
All the fields will be forwarded to Zoho as-is, but the following ones have
a special meaning:
- `_section`: The section to create the entry in. Defaults to 'Contacts'.


Demo usage
----------

> curl -X POST http://localhost:3000/ -d "Last Name=John Smith&Email=john@example.com"
