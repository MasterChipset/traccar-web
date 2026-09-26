import { useState } from 'react';
import TextField from '@mui/material/TextField';
import EditItemView from './components/EditItemView';
import EditAttributesAccordion from './components/EditAttributesAccordion';
import SlidingTabPanels from '../common/components/SlidingTabPanels';
import { useTranslation } from '../common/components/LocalizationProvider';
import SettingsMenu from './components/SettingsMenu';
import useFeatures from '../common/util/useFeatures';
import useSettingsStyles from './common/useSettingsStyles';

const DriverPage = () => {
  const { classes } = useSettingsStyles();
  const t = useTranslation();
  const features = useFeatures();

  const [item, setItem] = useState();

  const validate = () => item && item.name && item.uniqueId;

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
          <TextField
            value={item.uniqueId || ''}
            onChange={(event) => setItem({ ...item, uniqueId: event.target.value })}
            label={t('deviceIdentifier')}
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
      endpoint="drivers"
      item={item}
      setItem={setItem}
      validate={validate}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'sharedDriver']}
    >
      {item && <SlidingTabPanels tabs={tabs} />}
    </EditItemView>
  );
};

export default DriverPage;
