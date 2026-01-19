import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::comment.comment', ({ strapi }) => ({
    async create(ctx) {
        const user = ctx.state.user;
        if (!user) {
            return ctx.unauthorized("Authentication required");
        }

        // Ensure data object exists
        if (!ctx.request.body.data) {
            ctx.request.body.data = {};
        }

        // Set author to current user
        ctx.request.body.data.author = user.id;

        const response = await super.create(ctx);
        return response;
    }
}));
