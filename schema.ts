import { list } from '@keystone-6/core';
import { text, relationship, password, timestamp, select, integer, virtual, image, checkbox } from '@keystone-6/core/fields';
import { allowAll } from '@keystone-6/core/access';
import { document } from '@keystone-6/fields-document';

export const lists = {
  // User List
  User: list({
    access: {
      operation: {
        query: ({ session }) => !!session || true, // Allow any logged-in user to query
        create: ({ session }) => session?.data.role === 'admin', // Only admins can create users
        delete: ({ session }) => session?.data.role === 'admin', // Only admins can delete users
        update: ({ session }) => session?.data.role === 'admin' || session?.data.role === 'manager' || session?.data.role === 'guest', // Admins, managers, and guests can update
      },
      filter: {
        query: ({ session }) =>
          session?.data.role === 'admin'
            ? {} // Admins can query all users
            : { id: { equals: session.itemId } }, // Managers and guests can only query their own user data

        update: ({ session }) =>
          session?.data.role === 'admin'
            ? {} // Admins can update all users
            : { id: { equals: session.itemId } }, // Managers and guests can only update their own user data
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
          { label: 'Manager', value: 'manager' },
          { label: 'Guest', value: 'guest' },
        ],
        defaultValue: 'guest', // Default to guest if no role is assigned
      }),
      businesses: relationship({
        ref: 'Business.manager',
        many: true,
        ui: {
          displayMode: 'cards',
          cardFields: ['name', 'contactEmail'],
          inlineCreate: { fields: ['name', 'contactEmail'] },
          inlineEdit: { fields: ['name', 'contactEmail'] },
          inlineConnect: true,  // Enable connecting to existing businesses
        },
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
        initialColumns: ['name', 'email', 'role', 'createdAt'], // Show role instead of individual boolean fields
      },
    },
  }),

  Business: list({
    access: {
      operation: {
        query: () => true, // Allow any logged-in user to query
        create: ({ session }) => session?.data.role === 'admin', // Only admins can create
        update: ({ session }) => session?.data.role === 'admin' || session?.data.role === 'manager', // Admins and managers can update
        delete: ({ session }) => session?.data.role === 'admin', // Only admins can delete
      },
      filter: {
        query: ({ session }) =>
          session?.data.role === 'admin'
            ? {} // Admins can query all businesses
            : { manager: { id: { equals: session.itemId } } }, // Managers can only query businesses they manage
        update: ({ session }) =>
          session?.data.role === 'admin'
            ? {} // Admins can update all businesses
            : { manager: { id: { equals: session.itemId } } }, // Managers can only update businesses they manage
      },
    },
    fields: {
      name: text({ validation: { isRequired: true } }),
      description: document({
        formatting: true,
        links: true,
        layouts: [[1, 1], [1, 1, 1]],
      }),
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
      jobListings: relationship({ ref: 'JobListing.business', many: true }),
      createdAt: timestamp({
        defaultValue: { kind: 'now' },
        ui: { createView: { fieldMode: 'hidden' }, itemView: { fieldMode: 'read' } },
      }),
      manager: relationship({
        ref: 'User.businesses',
        ui: {
          displayMode: 'cards',
          cardFields: ['name', 'email'],
          inlineCreate: { fields: ['name', 'email'] },
          inlineEdit: { fields: ['name', 'email'] },
          inlineConnect: true,
        },
      }),
    },
    db: {
      idField: { kind: 'uuid' },
    },
    ui: {
      hideCreate: ({ session }) => session?.data.role === 'manager',
      listView: {
        initialColumns: ['name', 'contactEmail', 'location', 'manager'],
      },
    },
  }),

  Product: list({
    access: {
      operation: {
        query: ({ session }) => !!session, // Allow any logged-in user to query
        create: ({ session }) => session?.data.role === 'admin', // Only admins can create
        update: ({ session }) => session?.data.role === 'admin' || session?.data.role === 'manager', // Admins and managers can update
        delete: ({ session }) => session?.data.role === 'admin', // Only admins can delete
      },
      filter: {
        query: ({ session }) =>
          session?.data.role === 'admin'
            ? {} // Admins can query all products
            : { business: { manager: { id: { equals: session.itemId } } } }, // Managers can only query products from businesses they manage

        update: ({ session }) =>
          session?.data.role === 'admin'
            ? {} // Admins can update all products
            : { business: { manager: { id: { equals: session.itemId } } } }, // Managers can only update products from businesses they manage
      },
    },
    fields: {
      name: text({ validation: { isRequired: true } }),
      description: document({
        formatting: true, // Enables bold, italic, underline, etc.
        links: true,      // Enables hyperlink functionality
        layouts: [
          [1, 1],         // Supports multiple column layouts
          [1, 1, 1],
        ],
      }),
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
    access: {
      operation: {
        query: ({ session }) => !!session, // Allow any logged-in user to query
        create: ({ session }) => session?.data.role === 'admin', // Only admins can create
        update: ({ session }) => session?.data.role === 'admin' || session?.data.role === 'manager', // Admins and managers can update
        delete: ({ session }) => session?.data.role === 'admin', // Only admins can delete
      },
      filter: {
        query: ({ session }) =>
          session?.data.role === 'admin'
            ? {} // Admins can query all images
            : { product: { business: { manager: { id: { equals: session.itemId } } } } }, // Managers can only query images related to products of businesses they manage

        update: ({ session }) =>
          session?.data.role === 'admin'
            ? {} // Admins can update all images
            : { product: { business: { manager: { id: { equals: session.itemId } } } } }, // Managers can only update images related to products of businesses they manage
      },
    },
    fields: {
      file: image({ storage: 'local_images' }),
      product: relationship({ ref: 'Product.images' }), // Link back to Product
    },
  }),

  ProductReview: list({
    access: {
      operation: {
        query: ({ session }) => !!session, // Allow any logged-in user to query
        create: ({ session }) => session?.data.role === 'admin', // Only admins can create
        update: ({ session }) => session?.data.role === 'admin' || session?.data.role === 'manager', // Admins and managers can update
        delete: ({ session }) => session?.data.role === 'admin', // Only admins can delete
      },
      filter: {
        query: ({ session }) =>
          session?.data.role === 'admin'
            ? {} // Admins can query all reviews
            : { product: { business: { manager: { id: { equals: session.itemId } } } } }, // Managers can only query reviews for products of businesses they manage

        update: ({ session }) =>
          session?.data.role === 'admin'
            ? {} // Admins can update all reviews
            : { product: { business: { manager: { id: { equals: session.itemId } } } } }, // Managers can only update reviews for products of businesses they manage
      },
    },
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
    access: {
      operation: {
        query: ({ session }) => !!session, // Allow any logged-in user to query
        create: ({ session }) => session?.data.role === 'admin', // Only admins can create
        update: ({ session }) => session?.data.role === 'admin' || session?.data.role === 'manager', // Admins and managers can update
        delete: ({ session }) => session?.data.role === 'admin', // Only admins can delete
      },
      filter: {
        query: ({ session }) =>
          session?.data.role === 'admin'
            ? {} // Admins can query all complaints
            : { product: { business: { manager: { id: { equals: session.itemId } } } } }, // Managers can only query complaints for products of businesses they manage

        update: ({ session }) =>
          session?.data.role === 'admin'
            ? {} // Admins can update all complaints
            : { product: { business: { manager: { id: { equals: session.itemId } } } } }, // Managers can only update complaints for products of businesses they manage
      },
    },
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
        query: ({ session }) => !!session, // Allow any logged-in user to query
        create: ({ session }) => session?.data.role === 'admin', // Only admins can create
        update: ({ session }) => session?.data.role === 'admin' || session?.data.role === 'manager', // Admins and managers can update
        delete: ({ session }) => session?.data.role === 'admin', // Only admins can delete
      },
      filter: {
        query: ({ session }) =>
          session?.data.role === 'admin'
            ? {} // Admins can query all complaints
            : { business: { manager: { id: { equals: session.itemId } } } }, // Managers can only query complaints for businesses they manage

        update: ({ session }) =>
          session?.data.role === 'admin'
            ? {} // Admins can update all complaints
            : { business: { manager: { id: { equals: session.itemId } } } }, // Managers can only update complaints for businesses they manage
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
        query: ({ session }) => !!session, // Allow any logged-in user to query
        create: ({ session }) => session?.data.role === 'admin', // Only admins can create
        update: ({ session }) => session?.data.role === 'admin' || session?.data.role === 'manager', // Admins and managers can update
        delete: ({ session }) => session?.data.role === 'admin', // Only admins can delete
      },
      filter: {
        query: ({ session }) =>
          session?.data.role === 'admin'
            ? {} // Admins can query all reviews
            : { business: { manager: { id: { equals: session.itemId } } } }, // Managers can only query reviews for businesses they manage

        update: ({ session }) =>
          session?.data.role === 'admin'
            ? {} // Admins can update all reviews
            : { business: { manager: { id: { equals: session.itemId } } } }, // Managers can only update reviews for businesses they manage
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
        query: ({ session }) => !!session, // Allow any logged-in user to query
        create: ({ session }) => session?.data.role === 'admin', // Only admins can create
        update: ({ session }) => session?.data.role === 'admin' || session?.data.role === 'manager', // Admins and managers can update
        delete: ({ session }) => session?.data.role === 'admin', // Only admins can delete
      },
      filter: {
        query: ({ session }) =>
          session?.data.role === 'admin'
            ? {} // Admins can query all quotes
            : { business: { manager: { id: { equals: session.itemId } } } }, // Managers can only query quotes for businesses they manage

        update: ({ session }) =>
          session?.data.role === 'admin'
            ? {} // Admins can update all quotes
            : { business: { manager: { id: { equals: session.itemId } } } }, // Managers can only update quotes for businesses they manage
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
    access: {
      operation: {
        query: ({ session }) => !!session, // Allow any logged-in user to query
        create: ({ session }) => session?.data.role === 'admin', // Only admins can create
        update: ({ session }) => session?.data.role === 'admin' || session?.data.role === 'manager', // Admins and managers can update
        delete: ({ session }) => session?.data.role === 'admin', // Only admins can delete
      },
      filter: {
        query: ({ session }) =>
          session?.data.role === 'admin'
            ? {} // Admins can query all complaint replies
            : { business: { manager: { id: { equals: session.itemId } } } }, // Managers can only query complaint replies for businesses they manage

        update: ({ session }) =>
          session?.data.role === 'admin'
            ? {} // Admins can update all complaint replies
            : { business: { manager: { id: { equals: session.itemId } } } }, // Managers can only update complaint replies for businesses they manage
      },
    },
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
    access: {
      operation: {
        query: ({ session }) => !!session, // Allow any logged-in user to query
        create: ({ session }) => session?.data.role === 'admin', // Only admins can create
        update: ({ session }) => session?.data.role === 'admin' || session?.data.role === 'manager', // Admins and managers can update
        delete: ({ session }) => session?.data.role === 'admin', // Only admins can delete
      },
      filter: {
        query: ({ session }) =>
          session?.data.role === 'admin'
            ? {} // Admins can query all review replies
            : { business: { manager: { id: { equals: session.itemId } } } }, // Managers can only query review replies for businesses they manage

        update: ({ session }) =>
          session?.data.role === 'admin'
            ? {} // Admins can update all review replies
            : { business: { manager: { id: { equals: session.itemId } } } }, // Managers can only update review replies for businesses they manage
      },
    },
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
    access: {
      operation: {
        query: ({ session }) => !!session, // Allow any logged-in user to query
        create: ({ session }) => session?.data.role === 'admin', // Only admins can create
        update: ({ session }) => session?.data.role === 'admin' || session?.data.role === 'manager', // Admins and managers can update
        delete: ({ session }) => session?.data.role === 'admin', // Only admins can delete
      },
      filter: {
        query: ({ session }) =>
          session?.data.role === 'admin'
            ? {} // Admins can query all quote replies
            : { business: { manager: { id: { equals: session.itemId } } } }, // Managers can only query quote replies for businesses they manage

        update: ({ session }) =>
          session?.data.role === 'admin'
            ? {} // Admins can update all quote replies
            : { business: { manager: { id: { equals: session.itemId } } } }, // Managers can only update quote replies for businesses they manage
      },
    },
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

  JobListing: list({
    access: {
      operation: {
        query: ({ session }) => !!session, // Allow any logged-in user to query
        create: ({ session }) => session?.data.role === 'admin', // Only admins can create
        update: ({ session }) => session?.data.role === 'admin' || session?.data.role === 'manager', // Admins and managers can update
        delete: ({ session }) => session?.data.role === 'admin', // Only admins can delete
      },
      filter: {
        query: ({ session }) =>
          session?.data.role === 'admin'
            ? {} // Admins can query all job listings
            : { business: { manager: { id: { equals: session.itemId } } } }, // Managers can only query job listings for businesses they manage

        update: ({ session }) =>
          session?.data.role === 'admin'
            ? {} // Admins can update all job listings
            : { business: { manager: { id: { equals: session.itemId } } } }, // Managers can only update job listings for businesses they manage
      },
    },
    fields: {
      business: relationship({ ref: 'Business.jobListings', many: false }),
      title: text({ validation: { isRequired: true } }),
      description: text({ ui: { displayMode: 'textarea' } }),
      salary: integer({ validation: { min: 0 } }),
      location: text({ validation: { isRequired: true } }),
      createdAt: timestamp({
        ui: { itemView: { fieldMode: 'read' } }, // Remove defaultValue
      }),
      updatedAt: timestamp({
        ui: { itemView: { fieldMode: 'read' } }, // Remove defaultValue
      }),
    },
    hooks: {
      resolveInput: ({ resolvedData, operation }) => {
        if (operation === 'create') {
          resolvedData.createdAt = new Date(); // Set the current time for 'createdAt'
        }
        if (operation === 'update') {
          resolvedData.updatedAt = new Date(); // Update 'updatedAt' field on update
        }
        return resolvedData;
      },
    },
  })
};
export default {
  lists
};