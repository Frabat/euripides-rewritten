/**
 * A set of functions called "actions" for `custom-auth`
 */

export default ({ strapi }) => ({
    async register(ctx) {
        const params = ctx.request.body;

        // 1. Basic Validation
        if (!params.password || !params.email || !params.username) {
            return ctx.badRequest('Missing required fields');
        }

        if (params.isScholar && typeof params.isScholar !== 'boolean') {
            return ctx.badRequest('isScholar must be a boolean');
        }

        const { email, username, password, firstName, lastName, bio, institution, title, isScholar } = params;

        // 2. Determine Role
        let roleId;

        if (isScholar) {
            // Find Scholar Role
            const scholarRole = await strapi
                .query('plugin::users-permissions.role')
                .findOne({ where: { name: 'Scholar' } });

            if (scholarRole) {
                roleId = scholarRole.id;
            }
        }

        // Default Fallback
        if (!roleId) {
            const defaultRole = await strapi
                .query('plugin::users-permissions.role')
                .findOne({ where: { type: 'authenticated' } }); // Or 'public' if you prefer

            if (defaultRole) {
                roleId = defaultRole.id;
            }
        }

        if (!roleId) {
            throw new Error('Impossible to find the default role');
        }

        // 3. Check for existing user (Strapi service does this, but good to catch early)
        const userExists = await strapi.query('plugin::users-permissions.user').findOne({
            where: {
                $or: [{ email }, { username }]
            }
        });

        if (userExists) {
            return ctx.badRequest('Email or Username are already taken');
        }


        const newUser = {
            email,
            username,
            password,
            role: roleId,
            provider: 'local',
            confirmed: true, // Auto-confirm or check settings
            firstName,
            lastName,
            bio,
            institution,
            title,
            isScholar
        };

        try {
            // 4. Create User
            // We use the User Service from Users-Permissions to handle password hashing etc.
            const user = await strapi.plugin('users-permissions').service('user').add(newUser);

            // 5. Sanitize
            // 5. Sanitize (Manual, as service.sanitizeOutput is not exposed/found)
            const { password, resetPasswordToken, confirmationToken, ...sanitizedUser } = user;

            // 6. Issue JWT
            const jwt = strapi.plugin('users-permissions').service('jwt').issue({ id: user.id });

            return ctx.send({
                jwt,
                user: sanitizedUser,
            });

        } catch (err) {
            strapi.log.error('Custom Register Error:', err);
            return ctx.badRequest('Registration failed', { error: err });
        }
    }
});
