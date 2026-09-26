import { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  TextField,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import EditItemView from './components/EditItemView';
import EditAttributesAccordion from './components/EditAttributesAccordion';
import SlidingTabPanels from '../common/components/SlidingTabPanels';
import { useTranslation } from '../common/components/LocalizationProvider';
import useGeofenceAttributes from '../common/attributes/useGeofenceAttributes';
import SettingsMenu from './components/SettingsMenu';
import SelectField from '../common/components/SelectField';
import { geofencesActions } from '../store';
import useFeatures from '../common/util/useFeatures';
import useSettingsStyles from './common/useSettingsStyles';

const GeofencePage = () => {
  const { classes } = useSettingsStyles();
  const dispatch = useDispatch();
  const t = useTranslation();

  const geofenceAttributes = useGeofenceAttributes(t);
  const features = useFeatures();

  const [item, setItem] = useState();

  const onItemSaved = (result) => {
    dispatch(geofencesActions.update([result]));
  };

  const validate = () => item && item.name;

  const tabs = item && [
    {
      id: 'required',
      label: t('sharedRequired'),
      content: (
        <div className={classes.details}>
          <TextField
            value={item.name || ''}
            onChange={(event) => setItem({ ...item, name: event.target.value })}
            label={t('sharedName')}
          />
        </div>
      ),
    },
    {
      id: 'extra',
      label: t('sharedExtra'),
      content: (
        <div className={classes.details}>
          <TextField
            value={item.description || ''}
            onChange={(event) => setItem({ ...item, description: event.target.value })}
            label={t('sharedDescription')}
          />
          <SelectField
            value={item.calendarId}
            onChange={(event) => setItem({ ...item, calendarId: Number(event.target.value) })}
            endpoint="/api/calendars"
            label={t('sharedCalendar')}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={item.attributes.hide}
                onChange={(e) =>
                  setItem({
                    ...item,
                    attributes: { ...item.attributes, hide: e.target.checked },
                  })
                }
              />
            }
            label={t('sharedFilterMap')}
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
                definitions={geofenceAttributes}
              />
            ),
          },
        ]
      : []),
  ];

  return (
    <EditItemView
      endpoint="geofences"
      item={item}
      setItem={setItem}
      validate={validate}
      onItemSaved={onItemSaved}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'sharedGeofence']}
    >
      {item && <SlidingTabPanels tabs={tabs} />}
    </EditItemView>
  );
};

export default GeofencePage;
