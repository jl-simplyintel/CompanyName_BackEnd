import { graphql, list } from '@keystone-6/core';
import { text, relationship, password, timestamp, select, integer, virtual, image } from '@keystone-6/core/fields';
import { allowAll } from '@keystone-6/core/access';
import { BaseAccessArgs, AccessOperation } from '@keystone-6/core/dist/declarations/src/types/config/access-control';
import { BaseListTypeInfo, MaybePromise } from '@keystone-6/core/types';


export const lists = {
  // User List (Unchanged)
  User: list({
    access: {
      operation: {
        query: allowAll,
        create: allowAll,
        update: allowAll,
        delete: allowAll,
      },
    },
    fields: {
      name: text({ validation: { isRequired: true } }),
      email: text({
        validation: { isRequired: true },
        isIndexed: 'unique',
      }),
      password: password({
        validation: { isRequired: true },
        ui: {
          itemView: { fieldMode: 'hidden' }, // Admin cannot view or edit the password directly
        },
      }),
      role: select({
        options: [
          { label: 'Admin', value: 'admin' },
          { label: 'Guest', value: 'guest' },
        ],
        defaultValue: 'guest',
      }),
      reviews: relationship({ ref: 'Review.user', many: true }),
      productReviews: relationship({ ref: 'ProductReview.user', many: true }),
      quotes: relationship({ ref: 'Quote.user', many: true }),
      complaints: relationship({ ref: 'Complaint.user', many: true }),
      productComplaints: relationship({ ref: 'ProductComplaint.user', many: true }),
      createdAt: timestamp({
        defaultValue: { kind: 'now' },
        ui: {
          createView: { fieldMode: 'hidden' },
          itemView: { fieldMode: 'read' },
        },
      }),
    },
    ui: {
      listView: {
        initialColumns: ['name', 'email', 'role', 'createdAt'],
      },
    },
  }),

  // Business List (Simplified)
  Business: list({
    access: allowAll,
    fields: {
      name: text({ validation: { isRequired: true } }),
      description: text({ ui: { displayMode: 'textarea' } }),
      industry: text(),
      contactEmail: text({ validation: { isRequired: true } }),
      contactPhone: text(),
      website: text(),
      location: text(),
      address: text(),
      yearFounded: integer({ label: 'Year Founded' }),
      typeOfEntity: select({
        options: [
          { label: 'Limited Liability Company (LLC)', value: 'LLC' },
          { label: 'Corporation', value: 'corporation' },
          { label: 'Partnership', value: 'partnership' },
          { label: 'Sole Proprietorship', value: 'sole_proprietorship' },
        ],
        label: 'Type of Entity',
      }),
      businessHours: text({ ui: { displayMode: 'textarea' }, label: 'Business Hours' }),
      revenue: integer({ label: 'Revenue' }),
      employeeCount: integer({ label: 'Employee Count' }),
      keywords: text({ ui: { displayMode: 'textarea' }, label: 'Keywords' }),
      companyLinkedIn: text({ label: 'Company LinkedIn' }),
      companyFacebook: text({ label: 'Company Facebook' }),
      companyTwitter: text({ label: 'Company Twitter' }),
      technologiesUsed: text({ ui: { displayMode: 'textarea' }, label: 'Technologies Used' }),
      sicCodes: text({ label: 'SIC Codes' }),
      reviews: relationship({ ref: 'Review.business', many: true }),
      complaints: relationship({ ref: 'Complaint.business', many: true }),
      quotes: relationship({ ref: 'Quote.business', many: true }),
      products: relationship({ ref: 'Product.business', many: true }),
      createdAt: timestamp({
        defaultValue: { kind: 'now' },
        ui: { createView: { fieldMode: 'hidden' }, itemView: { fieldMode: 'read' } },
      }),
      manager: relationship({
        ref: 'User',
        ui: {
          displayMode: 'cards',
          cardFields: ['name', 'email'],
          inlineCreate: { fields: ['name', 'email'] },
          inlineEdit: { fields: ['name', 'email'] },
        },
      }),
    },
    db: {
      idField: { kind: 'uuid' },
    },
    ui: {
      listView: {
        initialColumns: ['name', 'industry', 'contactEmail', 'location', 'yearFounded'],
        initialSort: { field: 'name', direction: 'ASC' },
      },
    },
  }),

  Product: list({
    access: allowAll,
    fields: {
      name: text({ validation: { isRequired: true } }),
      description: text({ ui: { displayMode: 'textarea' } }),
      price: integer({ validation: { isRequired: true }, label: 'Price (in cents)' }),
      priceInDollars: virtual({
        field: graphql.field({
          type: graphql.Float,
          resolve(item: any) {
            return item.price / 100; // Convert cents to dollars
          },
        }),
        ui: {
          itemView: { fieldMode: 'read' }, // Read-only in the UI
        },
      }),
      stock: integer({ validation: { isRequired: true }, label: 'Stock Available' }),
      images: relationship({
        ref: 'Image.product',
        many: true,
        ui: {
          displayMode: 'cards',
          cardFields: ['file'],
          inlineCreate: { fields: ['file'] },
          inlineEdit: { fields: ['file'] }
        }
      }),
      business: relationship({
        ref: 'Business.products',
        ui: { displayMode: 'select' },
      }),
      createdAt: timestamp({
        defaultValue: { kind: 'now' },
        ui: { createView: { fieldMode: 'hidden' }, itemView: { fieldMode: 'read' } },
      }),
      reviews: relationship({ ref: 'ProductReview.product', many: true }),
      complaints: relationship({ ref: 'ProductComplaint.product', many: true }),
    },
    ui: {
      listView: {
        initialColumns: ['name', 'priceInDollars', 'stock', 'business'],
        initialSort: { field: 'name', direction: 'ASC' },
      },
    },
  }),
  
  Image: list({
    fields: {
      file: image({ storage: 'local_images' }),
      product: relationship({ ref: 'Product.images' }), // Link back to Product
    },
    access: allowAll,
  }),  

  ProductReview: list({
    access: allowAll,
    fields: {
      user: relationship({ ref: 'User.productReviews' }), // Correct relationship to User
      product: relationship({ ref: 'Product.reviews' }), // Link to Product
      rating: select({
        options: [
          { label: '1', value: '1' },
          { label: '2', value: '2' },
          { label: '3', value: '3' },
          { label: '4', value: '4' },
          { label: '5', value: '5' },
        ],
        defaultValue: '5',
      }),
      content: text({ ui: { displayMode: 'textarea' }, label: 'Review Content' }),
      moderationStatus: select({
        options: [
          { label: 'Approved', value: '0' },
          { label: 'Denied', value: '1' },
          { label: 'Pending Approval', value: '2' },
        ],
        defaultValue: '2',
        ui: { displayMode: 'segmented-control' },
      }),
      createdAt: timestamp({
        defaultValue: { kind: 'now' },
        ui: { createView: { fieldMode: 'hidden' }, itemView: { fieldMode: 'read' } },
      }),
    },
    ui: {
      listView: {
        initialColumns: ['user', 'product', 'rating', 'moderationStatus', 'createdAt'],
        initialSort: { field: 'createdAt', direction: 'DESC' },
      },
    },
  }),

  ProductComplaint: list({
    access: allowAll,
    fields: {
      user: relationship({ ref: 'User.productComplaints' }), // Link to User
      product: relationship({ ref: 'Product.complaints' }), // Link to Product
      subject: text({ validation: { isRequired: true } }),
      content: text({ ui: { displayMode: 'textarea' }, label: 'Complaint Content' }),
      status: select({
        options: [
          { label: 'Closed', value: '0' },
          { label: 'Pending', value: '1' },
        ],
        defaultValue: '1',
        ui: { displayMode: 'segmented-control', itemView: { fieldMode: 'edit' } },
      }),
      createdAt: timestamp({
        defaultValue: { kind: 'now' },
        ui: { createView: { fieldMode: 'hidden' }, itemView: { fieldMode: 'read' } },
      }),
    },
    ui: {
      listView: {
        initialColumns: ['user', 'product', 'status', 'createdAt'],
        initialSort: { field: 'createdAt', direction: 'DESC' },
      },
    },
  }),


  // Complaint List
  Complaint: list({
    access: {
      operation: {
        query: allowAll,
        create: allowAll,
        update: ({ session }) => !!session && session.data.role === 'admin',
        delete: ({ session }) => !!session && session.data.role === 'admin',
      },
    },
    fields: {
      user: relationship({ ref: 'User.complaints', ui: { itemView: { fieldMode: 'read' } } }),

      isAnonymous: select({
        options: [
          { label: 'Yes', value: 'true' },
          { label: 'No', value: 'false' },
        ],
        defaultValue: 'false',
        ui: { displayMode: 'segmented-control', itemView: { fieldMode: 'read' } }, // Read-only
      }),

      subject: text({
        validation: { isRequired: true },
        ui: { itemView: { fieldMode: 'read' } }, // Read-only
      }),

      content: text({
        ui: { displayMode: 'textarea', itemView: { fieldMode: 'read' } }, // Read-only
      }),

      business: relationship({
        ref: 'Business.complaints',
        ui: { itemView: { fieldMode: 'read' } }, // Read-only
      }),

      status: select({
        options: [
          { label: 'Closed', value: '0' },
          { label: 'Pending', value: '1' },
        ],
        defaultValue: '1',
        ui: { displayMode: 'segmented-control', itemView: { fieldMode: 'edit' } }, // Editable
      }),

      createdAt: timestamp({
        defaultValue: { kind: 'now' },
        ui: { itemView: { fieldMode: 'read' } }, // Read-only
      }),

      replies: relationship({ ref: 'ComplaintReply.complaint', many: true }),
    },
    ui: {
      listView: {
        initialColumns: ['user', 'isAnonymous', 'status', 'createdAt'],
        initialSort: { field: 'createdAt', direction: 'DESC' },
      },
    },
  }),

  // Review List
  Review: list({
    access: {
      operation: {
        query: allowAll,
        create: allowAll,
        update: ({ session }) => !!session && session.data.role === 'admin',
        delete: ({ session }) => !!session && session.data.role === 'admin',
      },
    },
    fields: {
      user: relationship({ ref: 'User.reviews', ui: { itemView: { fieldMode: 'read' } } }),

      isAnonymous: select({
        options: [
          { label: 'Yes', value: 'true' },
          { label: 'No', value: 'false' },
        ],
        defaultValue: 'false',
        ui: { displayMode: 'segmented-control', itemView: { fieldMode: 'read' } }, // Read-only
      }),

      rating: select({
        options: [
          { label: '1', value: '1' },
          { label: '2', value: '2' },
          { label: '3', value: '3' },
          { label: '4', value: '4' },
          { label: '5', value: '5' },
        ],
        defaultValue: '5',
        ui: { itemView: { fieldMode: 'read' } }, // Read-only
      }),

      content: text({
        ui: { displayMode: 'textarea', itemView: { fieldMode: 'read' } }, // Read-only
      }),

      business: relationship({
        ref: 'Business.reviews',
        ui: { itemView: { fieldMode: 'read' } }, // Read-only
      }),

      moderationStatus: select({
        options: [
          { label: 'Approved', value: '0' },
          { label: 'Denied', value: '1' },
          { label: 'Pending Approval', value: '2' },
        ],
        defaultValue: '2',
        ui: { displayMode: 'segmented-control', itemView: { fieldMode: 'edit' } }, // Editable by admin
      }),

      createdAt: timestamp({
        defaultValue: { kind: 'now' },
        ui: { itemView: { fieldMode: 'read' } }, // Read-only
      }),

      replies: relationship({ ref: 'ReviewReply.review', many: true }),
    },
    ui: {
      listView: {
        initialColumns: ['user', 'isAnonymous', 'rating', 'moderationStatus', 'createdAt'],
        initialSort: { field: 'createdAt', direction: 'DESC' },
      },
    },
  }),

  // Quote List
  Quote: list({
    access: {
      operation: {
        query: allowAll,
        create: allowAll,
        update: ({ session }) => !!session && session.data.role === 'admin',
        delete: ({ session }) => !!session && session.data.role === 'admin',
      },
    },
    fields: {
      user: relationship({ ref: 'User.quotes', ui: { itemView: { fieldMode: 'read' } } }),

      service: text({
        ui: { itemView: { fieldMode: 'read' } }, // Read-only
      }),

      message: text({
        ui: { displayMode: 'textarea', itemView: { fieldMode: 'read' } }, // Read-only
      }),

      business: relationship({
        ref: 'Business.quotes',
        ui: { itemView: { fieldMode: 'read' } }, // Read-only
      }),

      status: select({
        options: [
          { label: 'Pending', value: 'pending' },
          { label: 'Replied', value: 'replied' },
        ],
        defaultValue: 'pending',
        ui: { displayMode: 'segmented-control', itemView: { fieldMode: 'edit' } }, // Editable by admin
      }),

      createdAt: timestamp({
        defaultValue: { kind: 'now' },
        ui: { itemView: { fieldMode: 'read' } }, // Read-only
      }),

      replies: relationship({ ref: 'QuoteReply.quote', many: true }),
    },
    ui: {
      listView: {
        initialColumns: ['user', 'business', 'service', 'status', 'createdAt'],
        initialSort: { field: 'createdAt', direction: 'DESC' },
      },
      hideCreate: true,
    },
  }),

  // ComplaintReply List
  ComplaintReply: list({
    access: allowAll,
    fields: {
      content: text({ validation: { isRequired: true }, ui: { displayMode: 'textarea' } }),
      complaint: relationship({
        ref: 'Complaint.replies',
        ui: {
          displayMode: 'cards',
          cardFields: ['subject', 'content'],
          inlineCreate: { fields: ['subject', 'content'] },
          inlineEdit: { fields: ['subject', 'content'] },
          itemView: { fieldMode: 'read' }, // Make 'complaint' field read-only
        },
      }),
      business: relationship({
        ref: 'Business',
        ui: { itemView: { fieldMode: 'read' } }, // Make 'business' field read-only
      }),
      createdAt: timestamp({
        defaultValue: { kind: 'now' },
        ui: { itemView: { fieldMode: 'read' } }, // Make 'createdAt' field read-only
      }),
    },
    hooks: {
      resolveInput: async ({ resolvedData, context }) => {
        if (resolvedData.complaint) {
          const complaint = await context.db.Complaint.findOne({
            where: { id: resolvedData.complaint.connect.id },
          });
          if (complaint && complaint.business) {
            resolvedData.business = { connect: { id: complaint.business } };
          }
        }
        return resolvedData;
      },
    },
    ui: {
      listView: {
        initialColumns: ['content', 'complaint', 'business', 'createdAt'],
        initialSort: { field: 'createdAt', direction: 'DESC' },
      },
    },
  }),

  // ReviewReply List
  ReviewReply: list({
    access: allowAll,
    fields: {
      content: text({ validation: { isRequired: true }, ui: { displayMode: 'textarea' } }),
      review: relationship({
        ref: 'Review.replies',
        ui: {
          displayMode: 'cards',
          cardFields: ['content'],
          inlineCreate: { fields: ['content'] },
          inlineEdit: { fields: ['content'] },
          itemView: { fieldMode: 'read' }, // Make 'review' field read-only
        },
      }),
      business: relationship({
        ref: 'Business',
        ui: { itemView: { fieldMode: 'read' } }, // Make 'business' field read-only
      }),
      createdAt: timestamp({
        defaultValue: { kind: 'now' },
        ui: { itemView: { fieldMode: 'read' } }, // Make 'createdAt' field read-only
      }),
    },
    hooks: {
      resolveInput: async ({ resolvedData, context }) => {
        if (resolvedData.review) {
          const review = await context.db.Review.findOne({
            where: { id: resolvedData.review.connect.id },
          });
          if (review && review.business) {
            resolvedData.business = { connect: { id: review.business } };
          }
        }
        return resolvedData;
      },
    },
    ui: {
      listView: {
        initialColumns: ['content', 'review', 'business', 'createdAt'],
        initialSort: { field: 'createdAt', direction: 'DESC' },
      },
    },
  }),

  // QuoteReply List
  QuoteReply: list({
    access: allowAll,
    fields: {
      content: text({ validation: { isRequired: true }, ui: { displayMode: 'textarea' } }),
      quote: relationship({
        ref: 'Quote.replies',
        ui: {
          displayMode: 'cards',
          cardFields: ['service'],
          inlineCreate: { fields: ['service'] },
          inlineEdit: { fields: ['service'] },
          itemView: { fieldMode: 'read' }, // Make 'quote' field read-only
        },
      }),
      business: relationship({
        ref: 'Business',
        ui: { itemView: { fieldMode: 'read' } }, // Make 'business' field read-only
      }),
      createdAt: timestamp({
        defaultValue: { kind: 'now' },
        ui: { itemView: { fieldMode: 'read' } }, // Make 'createdAt' field read-only
      }),
    },
    hooks: {
      resolveInput: async ({ resolvedData, context }) => {
        if (resolvedData.quote) {
          const quote = await context.db.Quote.findOne({
            where: { id: resolvedData.quote.connect.id },
          });
          if (quote && quote.business) {
            resolvedData.business = { connect: { id: quote.business } };
          }
        }
        return resolvedData;
      },
    },
    ui: {
      listView: {
        initialColumns: ['content', 'quote', 'business', 'createdAt'],
        initialSort: { field: 'createdAt', direction: 'DESC' },
      },
    },
  }),


};
export default {
  lists
};