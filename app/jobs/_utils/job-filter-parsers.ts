import { 
  parseAsString, 
  parseAsInteger, 
  parseAsStringLiteral, 
  createParser,
  type UrlKeys
} from 'nuqs/server'; 
import { 
  jobTypeEnum, 
  workLocationEnum, 
  experienceLevelEnum 
} from '@/lib/db/schema';

// Custom parser that handles 'all' value as null
export const parseAsStringOrAll = createParser({
  parse: (value) => {
    return value === 'all' ? null : value;
  },
  serialize: (value) => {
    return value === null ? 'all' : value;
  }
});

// Define parsers for URL state
export const jobFiltersParsers = {
  search: parseAsString.withDefault(''),
  locationId: parseAsStringOrAll,
  jobType: parseAsStringLiteral([...jobTypeEnum.enumValues, 'all'] as const).withDefault('all'),
  workLocation: parseAsStringLiteral([...workLocationEnum.enumValues, 'all'] as const).withDefault('all'),
  experienceLevel: parseAsStringLiteral([...experienceLevelEnum.enumValues, 'all'] as const).withDefault('all'),
  salaryMin: parseAsInteger,
  salaryMax: parseAsInteger,
  industryId: parseAsStringOrAll,
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(10)
};

// Define URL keys for shorter params
export const jobFiltersUrlKeys: UrlKeys<typeof jobFiltersParsers> = {
  search: 'q',
  locationId: 'loc',
  jobType: 'type',
  workLocation: 'wloc',
  experienceLevel: 'exp',
  salaryMin: 'smin',
  salaryMax: 'smax',
  industryId: 'ind',
  page: 'p',
  pageSize: 'ps'
}; 