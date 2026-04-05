import {defineField, defineType} from 'sanity'

export const trustPointType = defineType({
  name: 'trustPoint',
  title: 'Trust Point',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'iconName',
      title: 'Icon Name',
      type: 'string',
      description: 'Ten icon tu bo icon frontend (vd: shield, truck, sparkles, users)',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'iconName',
    },
  },
})
