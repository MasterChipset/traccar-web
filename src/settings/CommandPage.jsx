import { useState } from 'react';
import {
  TextField,
} from '@mui/material';
import EditItemView from './components/EditItemView';
import { useTranslation } from '../common/components/LocalizationProvider';
import BaseCommandView from './components/BaseCommandView';
import SlidingTabPanels from '../common/components/SlidingTabPanels';
import SettingsMenu from './components/SettingsMenu';
import useSettingsStyles from './common/useSettingsStyles';

const CommandPage = () => {
  const { classes } = useSettingsStyles();
  const t = useTranslation();

  const [item, setItem] = useState();

  const validate = () => item && item.type;

  const tabs = item && [
    {
      id: 'required',
      label: t('sharedRequired'),
      content: (
        <div className={classes.details}>
          <TextField
            value={item.description || ''}
            onChange={(event) => setItem({ ...item, description: event.target.value })}
            label={t('sharedDescription')}
          />
          <BaseCommandView item={item} setItem={setItem} />
        </div>
      ),
    },
  ];

  return (
    <EditItemView
      endpoint="commands"
      item={item}
      setItem={setItem}
      validate={validate}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'sharedSavedCommand']}
    >
      {item && <SlidingTabPanels tabs={tabs} />}
    </EditItemView>
  );
};

export default CommandPage;
