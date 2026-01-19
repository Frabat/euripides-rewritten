// import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) { },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: any }) {
    try {
      const publicRoleName = 'Public';
      const authenticatedRoleName = 'Authenticated';
      const scholarRoleName = 'Scholar';

      // 1. Define Permissions
      const readPermissions = [
        'api::author.author.find',
        'api::author.author.findOne',
        'api::catalog.catalog.find',
        'api::catalog.catalog.findOne',
        'api::document.document.find',
        'api::document.document.findOne',
      ];

      const writePermissions = [
        'api::catalog.catalog.create',
        'api::catalog.catalog.update',
        'api::document.document.create',
        'plugin::upload.content-api.upload'
      ];

      // 2. Helper to grant permissions
      const grantPermissions = async (roleName: string, actions: string[]) => {
        const role = await strapi.query('plugin::users-permissions.role').findOne({
          where: { name: roleName }
        });

        if (!role) {
          strapi.log.info(`Role "${roleName}" not found, skipping.`);
          return;
        }

        for (const action of actions) {
          const existing = await strapi.query('plugin::users-permissions.permission').findOne({
            where: { role: role.id, action }
          });

          if (!existing) {
            await strapi.query('plugin::users-permissions.permission').create({
              data: { action, role: role.id }
            });
            strapi.log.info(`Granted permission "${action}" to role "${roleName}"`);
          }
        }
      };

      // 3. Apply Permissions
      // Public: Read Only
      await grantPermissions(publicRoleName, readPermissions);

      // Authenticated: Read + Write (maybe distinct later, for now grant all)
      await grantPermissions(authenticatedRoleName, [...readPermissions, ...writePermissions]);

      // Scholar: Read + Write
      await grantPermissions(scholarRoleName, [...readPermissions, ...writePermissions]);

      strapi.log.info("Bootstrap permissions check completed.");

    } catch (e) {
      strapi.log.error("Bootstrap error:", e);
    }
  },
};
