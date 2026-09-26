import { useState } from 'react';
import { useDispatch } from 'react-redux';
import TextField from '@mui/material/TextField';

import EditItemView from './components/EditItemView';
import EditAttributesAccordion from './components/EditAttributesAccordion';
import SelectField from '../common/components/SelectField';
import SlidingTabPanels from '../common/components/SlidingTabPanels';
import { useTranslation } from '../common/components/LocalizationProvider';
import SettingsMenu from './components/SettingsMenu';
import useCommonDeviceAttributes from '../common/attributes/useCommonDeviceAttributes';
import useGroupAttributes from '../common/attributes/useGroupAttributes';
import useFeatures from '../common/util/useFeatures';
import { useCatch } from '../reactHelper';
import { groupsActions } from '../store';
import useSettingsStyles from './common/useSettingsStyles';
import fetchOrThrow from '../common/util/fetchOrThrow';

const GroupPage = () => {
  const { classes } = useSettingsStyles();
  const dispatch = useDispatch();
  const t = useTranslation();

  const commonDeviceAttributes = useCommonDeviceAttributes(t);
  const groupAttributes = useGroupAttributes(t);
  const features = useFeatures();

  const [item, setItem] = useState();

  const onItemSaved = useCatch(async () => {
    const response = await fetchOrThrow('/api/groups');
    dispatch(groupsActions.refresh(await response.json()));
  });

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
          <SelectField
            value={item.groupId}
            onChange={(event) => setItem({ ...item, groupId: Number(event.target.value) })}
            endpoint="/api/groups"
            label={t('groupParent')}
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
                definitions={{ ...commonDeviceAttributes, ...groupAttributes }}
              />
            ),
          },
        ]
      : []),
  ];

  return (
    <EditItemView
      endpoint="groups"
      item={item}
      setItem={setItem}
      validate={validate}
      onItemSaved={onItemSaved}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'groupDialog']}
    >
      {item && <SlidingTabPanels tabs={tabs} />}
    </EditItemView>
  );
};

export default GroupPage;
