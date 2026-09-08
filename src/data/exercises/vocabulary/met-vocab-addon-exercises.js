import { vocabAddon } from './vocab-55.js';
import { education as writing_education } from '../writing/topics/education.js';
import { technology as writing_technology } from '../writing/topics/technology.js';
import { work_career as writing_work_career } from '../writing/topics/work_career.js';
import { environment as writing_environment } from '../writing/topics/environment.js';
import { healthcare as writing_healthcare } from '../writing/topics/healthcare.js';
import { travel_culture as writing_travel_culture } from '../writing/topics/travel_culture.js';
import { media_news as writing_media_news } from '../writing/topics/media_news.js';
import { community as writing_community } from '../writing/topics/community.js';

import { money_consumer as speaking_money_consumer } from '../speaking/topics/money_consumer.js';
import { community as speaking_community } from '../speaking/topics/community.js';
import { work_career as speaking_work_career } from '../speaking/topics/work_career.js';
import { travel_culture as speaking_travel_culture } from '../speaking/topics/travel_culture.js';
import { education as speaking_education } from '../speaking/topics/education.js';
import { healthcare as speaking_healthcare } from '../speaking/topics/healthcare.js';
import { media_news as speaking_media_news } from '../speaking/topics/media_news.js';
import { family_relationships as speaking_family_relationships } from '../speaking/topics/family_relationships.js';
import { technology as speaking_technology } from '../speaking/topics/technology.js';
import { environment as speaking_environment } from '../speaking/topics/environment.js';

const base = {
  work_career: [],
  healthcare: [],
  education: [],
  technology: [],
  environment: [],
  community: [],
  travel_culture: [],
  money_consumer: [],
  family_relationships: [],
  media_news: [],
  general: [],
};

const addonExercises = {
  ...base,
  ...vocabAddon,
  ...speaking_money_consumer && { money_consumer: [...(base.money_consumer || []), ...speaking_money_consumer] },
  ...speaking_community && { community: [...(base.community || []), ...speaking_community] },
  ...speaking_work_career && { work_career: [...(base.work_career || []), ...speaking_work_career] },
  ...speaking_travel_culture && { travel_culture: [...(base.travel_culture || []), ...speaking_travel_culture] },
  ...speaking_education && { education: [...(base.education || []), ...speaking_education] },
  ...speaking_healthcare && { healthcare: [...(base.healthcare || []), ...speaking_healthcare] },
  ...speaking_media_news && { media_news: [...(base.media_news || []), ...speaking_media_news] },
  ...speaking_family_relationships && { family_relationships: [...(base.family_relationships || []), ...speaking_family_relationships] },
  ...speaking_technology && { technology: [...(base.technology || []), ...speaking_technology] },
  ...speaking_environment && { environment: [...(base.environment || []), ...speaking_environment] },
  ...writing_education && { education: [...(base.education || []), ...writing_education] },
  ...writing_technology && { technology: [...(base.technology || []), ...writing_technology] },
  ...writing_work_career && { work_career: [...(base.work_career || []), ...writing_work_career] },
  ...writing_environment && { environment: [...(base.environment || []), ...writing_environment] },
  ...writing_healthcare && { healthcare: [...(base.healthcare || []), ...writing_healthcare] },
  ...writing_travel_culture && { travel_culture: [...(base.travel_culture || []), ...writing_travel_culture] },
  ...writing_media_news && { media_news: [...(base.media_news || []), ...writing_media_news] },
  ...writing_community && { community: [...(base.community || []), ...writing_community] },
};

export default addonExercises;