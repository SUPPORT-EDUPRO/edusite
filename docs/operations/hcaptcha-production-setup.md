# Enable hCaptcha for the EduSitePro contact form

The website already has a public hCaptcha site key. Production still needs the matching secret
key before `/api/lead` can accept enquiries.

## Get the secret from hCaptcha

1. Open [the hCaptcha dashboard](https://dashboard.hcaptcha.com/) and sign in to the account that
   owns the Young Eagles site key.
2. Open **Sites** and confirm that the site includes the live EduSitePro or Young Eagles domain.
   If it does not exist, create a site and add the live hostname. Copy its public site key for
   `NEXT_PUBLIC_HCAPTCHA_SITE_KEY`.
3. Open your profile menu, choose **Settings**, and find the secret section.
4. If no usable secret is available, select **Generate New Secret** and copy it immediately.
   hCaptcha says it does not retain the value for later display.
5. Keep the secret private. Do not paste it into chat, email, source code, screenshots, or a commit.

The hCaptcha labels above are documented in October 2026. The dashboard layout can move them,
but the official documentation still names **Sites**, **Settings**, and **Generate New Secret**.

## Add it to Vercel production

1. Open the Vercel dashboard and select the **EduSitePro** project.
2. Open **Settings** in the sidebar, then **Environment Variables**.
3. Add a variable named `HCAPTCHA_SECRET_KEY`.
4. Paste the hCaptcha secret into **Value**.
5. Select **Production**. Add Preview separately only if preview deployments need real enquiries.
6. Save the variable.
7. Open **Deployments**, find the latest production deployment, open its three-dot menu, and choose
   **Redeploy**. Environment changes only reach new deployments.
8. After the redeploy succeeds, submit one genuine test enquiry on the live contact form. Confirm
   that the page reports success and that the enquiry reaches the expected school inbox or system.
9. If the form still fails, inspect the new deployment's function logs for `/api/lead`. Do not copy
   the secret into the log search or into a support message.

## Official references

- hCaptcha: <https://docs.hcaptcha.com/>
- Vercel environment variables: <https://vercel.com/docs/environment-variables/managing-environment-variables>
