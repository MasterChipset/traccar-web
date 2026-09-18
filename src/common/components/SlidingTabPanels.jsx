import { useState, useEffect } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

/*
 * ------------------------------------------------------------
 * SlidingTabPanels
 * ------------------------------------------------------------
 *
 * A reusable tab strip + sliding panel viewport, factored out of
 * DevicePage. Drop-in replacement for a group of MUI Accordions
 * when you'd rather present sections as tabs.
 *
 * BEHAVIOR
 *
 * - The tab bar is sticky (`position: sticky, top: 0`), so it
 *   stays visible while a tall panel's content scrolls beneath it.
 *   This relies on a scrollable ancestor existing somewhere above
 *   this component; if none exists, sticky has no visible effect.
 *
 * - Panels only transition between the tab you're leaving and the
 *   tab you're entering. Every other panel is repositioned with
 *   `transition: none`, so it's never dragged across the viewport
 *   when the user jumps more than one tab at a time.
 *
 * - All panels passed in `tabs` stay mounted for as long as they
 *   remain in the array, so form state, fetched SelectField data,
 *   etc. survive switching tabs.
 *
 * - Panels are tracked by `id`, not array index, so it's safe for
 *   the `tabs` array to change composition between renders (e.g. a
 *   tab that only appears once a record has been saved). If the
 *   active tab disappears from the array, focus falls back to the
 *   first remaining tab.
 *
 * PROPS
 *
 * tabs: Array<{
 *   id: string,       // stable, unique across renders
 *   label: string,    // tab label
 *   content: ReactNode,
 *   disabled?: boolean,
 * }>
 *
 * arrowIconSize: number — font size (px) for the scroll-button
 * arrows shown when tabs overflow. Defaults to 32.
 */

const SlidingTabPanels = ({ tabs, arrowIconSize = 32 }) => {
  const ids = tabs.map((tabDef) => tabDef.id);

  const [activeId, setActiveId] = useState(ids[0]);
  const [prevId, setPrevId] = useState(null);
  const [direction, setDirection] = useState(1);
  const [animatePhase, setAnimatePhase] = useState('idle');

  // If the active tab disappears from the array (composition
  // changed), fall back to the first remaining tab instead of
  // rendering nothing.
  useEffect(() => {
    if (ids.length > 0 && !ids.includes(activeId)) {
      setActiveId(ids[0]);
      setPrevId(null);
      setAnimatePhase('idle');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join('|')]);

  const activeIndex = ids.indexOf(activeId);

  const handleTabChange = (event, newId) => {
    if (newId === activeId) return;

    const newIndex = ids.indexOf(newId);
    setDirection(newIndex > activeIndex ? 1 : -1);
    setPrevId(activeId);
    setActiveId(newId);
    // 'start': the incoming panel snaps off-screen with no
    // transition, ready to animate in on the next frame.
    setAnimatePhase('start');
  };

  // Flip from 'start' to 'end' on the next animation frame so the
  // browser paints the off-screen starting position first, then
  // transitions to the final position on the following frame.
  useEffect(() => {
    if (animatePhase === 'start') {
      const raf = requestAnimationFrame(() => setAnimatePhase('end'));
      return () => cancelAnimationFrame(raf);
    }
    return undefined;
  }, [animatePhase]);

  const handlePanelTransitionEnd = () => {
    if (animatePhase === 'end') {
      setPrevId(null);
      setAnimatePhase('idle');
    }
  };

  // Where panel `id` should sit, expressed as a multiple of 100%
  // width. 0 = fully visible.
  const getPanelSlot = (id) => {
    if (id === activeId) {
      return animatePhase === 'start' ? direction : 0;
    }
    if (id === prevId) {
      return animatePhase === 'start' ? 0 : -direction;
    }
    // Uninvolved panel: parked off-screen, never animated.
    return ids.indexOf(id) > activeIndex ? 2 : -2;
  };

  const getPanelTransition = (id) => {
    const involved = id === activeId || id === prevId;
    return involved && animatePhase === 'end'
      ? 'transform 300ms ease-in-out'
      : 'none';
  };

  return (
    <>
      {/* ================================================
          STICKY TAB BAR
          ================================================ */}

      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Tabs
          value={activeId}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          slots={{
            startScrollButtonIcon: ArrowLeftIcon,
            endScrollButtonIcon: ArrowRightIcon,
          }}
          slotProps={{
            startScrollButtonIcon: {
              sx: { fontSize: arrowIconSize },
            },
            endScrollButtonIcon: {
              sx: { fontSize: arrowIconSize },
            },
          }}
        >
          {tabs.map((tabDef) => (
            <Tab
              key={tabDef.id}
              value={tabDef.id}
              label={tabDef.label}
              disabled={tabDef.disabled}
            />
          ))}
        </Tabs>
      </Box>

      {/* ================================================
          PANEL VIEWPORT

          Each panel is positioned independently (not one
          shared track), so only the two panels involved in
          a transition ever move across the viewport.
          ================================================ */}

      <Box
        sx={{
          mt: 2,
          width: '100%',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {tabs.map((tabDef) => (
          <Box
            key={tabDef.id}
            onTransitionEnd={
              tabDef.id === activeId
                ? handlePanelTransitionEnd
                : undefined
            }
            sx={{
              position:
                tabDef.id === activeId ? 'relative' : 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              boxSizing: 'border-box',

              transform: `translateX(${
                getPanelSlot(tabDef.id) * 100
              }%)`,

              transition: getPanelTransition(tabDef.id),

              willChange: 'transform',
            }}
          >
            {tabDef.content}
          </Box>
        ))}
      </Box>
    </>
  );
};

export default SlidingTabPanels;
