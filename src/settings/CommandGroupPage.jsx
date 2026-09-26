import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  TextField,
} from '@mui/material';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import SlidingTabPanels from '../common/components/SlidingTabPanels';
import { useCatch } from '../reactHelper';
import useSettingsStyles from './common/useSettingsStyles';
import fetchOrThrow from '../common/util/fetchOrThrow';

const CommandDevicePage = () => {
  const navigate = useNavigate();
  const { classes } = useSettingsStyles();
  const t = useTranslation();

  const { id } = useParams();

  const textEnabled = useSelector((state) => state.session.server.textEnabled);

  const [item, setItem] = useState({ type: 'custom', attributes: {} });

  const handleSend = useCatch(async () => {
    const query = new URLSearchParams({ groupId: id });
    await fetchOrThrow(`/api/commands/send?${query.toString()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    navigate(-1);
  });

  const tabs = [
    {
      id: 'required',
      label: t('sharedRequired'),
      content: (
        <div className={classes.details}>
          <FormControl fullWidth>
            <InputLabel>{t('sharedType')}</InputLabel>
            <Select label={t('sharedType')} value="custom" disabled>
              <MenuItem value="custom">{t('commandCustom')}</MenuItem>
            </Select>
          </FormControl>
          <TextField
            value={item.attributes.data}
            onChange={(e) =>
              setItem({ ...item, attributes: { ...item.attributes, data: e.target.value } })
            }
            label={t('commandData')}
          />
          {textEnabled && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={item.textChannel}
                  onChange={(event) => setItem({ ...item, textChannel: event.target.checked })}
                />
              }
              label={t('commandSendSms')}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'deviceCommand']}>
      <Container maxWidth="xs" className={classes.container}>
        <SlidingTabPanels tabs={tabs} />
        <div className={classes.buttons}>
          <Button type="button" color="primary" variant="outlined" onClick={() => navigate(-1)}>
            {t('sharedCancel')}
          </Button>
          <Button
            type="button"
            color="primary"
            variant="contained"
            onClick={handleSend}
            disabled={!item.attributes.data}
          >
            {t('commandSend')}
          </Button>
        </div>
      </Container>
    </PageLayout>
  );
};

export default CommandDevicePage;
