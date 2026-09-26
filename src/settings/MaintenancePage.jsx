import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import {
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { prefixString } from '../common/util/stringUtils';
import EditItemView from './components/EditItemView';
import EditAttributesAccordion from './components/EditAttributesAccordion';
import SlidingTabPanels from '../common/components/SlidingTabPanels';
import { useAttributePreference } from '../common/util/preferences';
import {
  speedFromKnots,
  speedToKnots,
  distanceFromMeters,
  distanceToMeters,
} from '../common/util/converter';
import { useTranslation } from '../common/components/LocalizationProvider';
import usePositionAttributes from '../common/attributes/usePositionAttributes';
import SettingsMenu from './components/SettingsMenu';
import useFeatures from '../common/util/useFeatures';
import useSettingsStyles from './common/useSettingsStyles';

const MaintenancePage = () => {
  const { classes } = useSettingsStyles();
  const t = useTranslation();

  const positionAttributes = usePositionAttributes(t);
  const features = useFeatures();

  const [item, setItem] = useState();
  const [labels, setLabels] = useState({ start: '', period: '' });

  const speedUnit = useAttributePreference('speedUnit', 'kn');
  const distanceUnit = useAttributePreference('distanceUnit', 'km');

  const convertToList = (attributes) => {
    const otherList = [];
    Object.keys(attributes).forEach((key) => {
      const value = attributes[key];
      if (value.type === 'number' || key.endsWith('Time')) {
        otherList.push({ key, name: value.name, type: value.type });
      }
    });
    return otherList;
  };

  useEffect(() => {
    const attribute = positionAttributes[item?.type];
    if (item?.type?.endsWith('Time')) {
      setLabels({ start: null, period: t('sharedDays') });
    } else if (attribute && attribute.dataType) {
      switch (attribute.dataType) {
        case 'speed':
          setLabels({
            start: t(prefixString('shared', speedUnit)),
            period: t(prefixString('shared', speedUnit)),
          });
          break;
        case 'distance':
          setLabels({
            start: t(prefixString('shared', distanceUnit)),
            period: t(prefixString('shared', distanceUnit)),
          });
          break;
        case 'hours':
          setLabels({ start: t('sharedHours'), period: t('sharedHours') });
          break;
        default:
          setLabels({ start: null, period: null });
          break;
      }
    } else {
      setLabels({ start: null, period: null });
    }
  }, [item?.type, positionAttributes, speedUnit, distanceUnit, t]);

  const rawToValue = (start, value) => {
    const attribute = positionAttributes[item.type];
    if (item.type?.endsWith('Time')) {
      if (start) {
        return dayjs(value).locale('en').format('YYYY-MM-DD');
      }
      return value / 86400000;
    }
    if (attribute && attribute.dataType) {
      switch (attribute.dataType) {
        case 'speed':
          return speedFromKnots(value, speedUnit);
        case 'distance':
          return distanceFromMeters(value, distanceUnit);
        case 'hours':
          return value / 3600000;
        default:
          return value;
      }
    }
    return value;
  };

  const valueToRaw = (start, value) => {
    const attribute = positionAttributes[item.type];
    if (item.type?.endsWith('Time')) {
      if (start) {
        return dayjs(value, 'YYYY-MM-DD').valueOf();
      }
      return value * 86400000;
    }
    if (attribute && attribute.dataType) {
      switch (attribute.dataType) {
        case 'speed':
          return speedToKnots(value, speedUnit);
        case 'distance':
          return distanceToMeters(value, distanceUnit);
        case 'hours':
          return value * 3600000;
        default:
          return value;
      }
    }
    return value;
  };

  const validate = () => item && item.name && item.type && item.start && item.period;

  const tabs = item && [
    {
      id: 'required',
      label: t('sharedRequired'),
      content: (
        <div className={classes.details}>
          <TextField
            value={item.name || ''}
            onChange={(e) => setItem({ ...item, name: e.target.value })}
            label={t('sharedName')}
          />
          <FormControl>
            <InputLabel>{t('sharedType')}</InputLabel>
            <Select
              label={t('sharedType')}
              value={item.type || ''}
              onChange={(e) => setItem({ ...item, type: e.target.value, start: 0, period: 0 })}
            >
              {convertToList(positionAttributes).map(({ key, name }) => (
                <MenuItem key={key} value={key}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            type={item.type?.endsWith('Time') ? 'date' : 'number'}
            value={rawToValue(true, item.start) || ''}
            onChange={(e) => setItem({ ...item, start: valueToRaw(true, e.target.value) })}
            label={
              labels.start
                ? `${t('maintenanceStart')} (${labels.start})`
                : t('maintenanceStart')
            }
          />
          <TextField
            type="number"
            value={rawToValue(false, item.period) || ''}
            onChange={(e) => setItem({ ...item, period: valueToRaw(false, e.target.value) })}
            label={
              labels.period
                ? `${t('maintenancePeriod')} (${labels.period})`
                : t('maintenancePeriod')
            }
          />
        </div>
      ),
    },
    ...(!features.disableAttributes
      ? [
          {
            id: 'attributes',
            label: t('sharedAttributes'),
            content: (
              <EditAttributesAccordion
                bare
                attributes={item.attributes}
                setAttributes={(attributes) => setItem({ ...item, attributes })}
                definitions={{}}
              />
            ),
          },
        ]
      : []),
  ];

  return (
    <EditItemView
      endpoint="maintenance"
      item={item}
      setItem={setItem}
      validate={validate}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'sharedMaintenance']}
    >
      {item && <SlidingTabPanels tabs={tabs} />}
    </EditItemView>
  );
};

export default MaintenancePage;
