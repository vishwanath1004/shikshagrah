//@ts-nocheck

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { Footer } from '../Footer/Footer';
import { TopAppBar } from '../Header/TopAppBar';
import { CommonSearch } from '../Search/CommonSearch';
import { CommonDrawer } from '../Drawer/CommonDrawer';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Radio,
  RadioGroup,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
interface LayoutProps {
  children: React.ReactNode;
  isLoadingChildren?: boolean;
  isFooter?: boolean;
  showBack?: boolean;
  backTitle?: string;
  showLogo?: boolean;
  showFilter?: boolean;
  sx?: object;
  categorieItems?: {
    text: string;
    to: string;
    icon?: React.ReactNode;
  }[];
  drawerItems?: {
    text: string;
    to: string;
    icon?: React.ReactNode;
  }[];
  onItemClick?: (to: string) => void;
  backIconClick?: () => void;
  showSearch?: {
    placeholder: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    onLeftIconClick?: () => void;
    onRightIconClick?: () => void;
    inputValue?: string;
    onInputChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    sx?: object;
  };

  showTopAppBar?: {
    title?: string;
    showMenuIcon?: boolean;
    showBackIcon?: boolean;
    backIconClick?: () => void;
    menuIconClick?: () => void;
    onMenuClose?: () => void;
    actionButtonLabel?: string;
    actionButtonClick?: () => void;
    actionButtonColor?: 'inherit' | 'primary' | 'secondary' | 'default';
    position?: 'fixed' | 'absolute' | 'sticky' | 'static' | 'relative';
    color?: 'primary' | 'secondary' | 'default' | 'transparent' | 'inherit';
    profileIcon?: {
      icon: React.ReactNode;
      ariaLabel: string;
      anchorEl?: HTMLElement | null;
      onLogoutClick?: (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
      ) => void;
      onOptionClick?: (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
      ) => void;
    }[];
    actionIcons?: {
      icon: React.ReactNode;
      ariaLabel: string;
      anchorEl?: HTMLElement | null;
      onLogoutClick?: (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
      ) => void;
      onOptionClick?: (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
      ) => void;
    }[];
  };
  topAppBarIcons?: {
    icon: React.ReactNode;
    ariaLabel: string;
    onClick: () => void;
  }[];
  filter?: {
    sort?: boolean;
    language?: string[];
    subject?: string[];
    contentType?: string[];
  };
  currentSelectedValues?;
  language?: string;
  selectedSubjects?: string[];
  selectedContentTypes?: string[];
  sort?: any;
  onSubjectsChange?: (subjects: string) => void;
  onLanguageChange?: (language: string) => void;
  onContentTypeChange?: (contentType: string) => void;
  onSortChange?: (sort: any) => void;
  onApply?: () => void;
}
const FilterDialog = ({
  open,
  onClose,
  filter,
  language,
  selectedSubjects,
  selectedContentTypes,
  sort,
  onLanguageChange,
  onSubjectsChange,
  onContentTypeChange,
  onSortChange,
  onApply,
  frameworkFilter,
  filterValues,
}: {
  open: boolean;
  onClose: () => void;
  filter?: LayoutProps['filter'];
  language: string;
  selectedSubjects?: string[];
  selectedContentTypes?: string[];
  sort?: any;
  onLanguageChange?: (language: string) => void;
  onSubjectsChange?: (subjects: string) => void;
  onContentTypeChange?: (contentType: string) => void;
  onSortChange?: (sort: any) => void;
  onApply?: () => void;
  frameworkFilter: any;
  filterValues: any;
}) => {
  // Manage the selected values for each category
  const [selectedValues, setSelectedValues] = useState(
    filterValues ? filterValues : {}
  ); // Initialize as an empty object

  const handleChange = (event: any, filterCode: any) => {
    const { value } = event.target;

    setSelectedValues((prev: any) => ({
      ...prev,
      [filterCode]: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      sx={{
        borderRadius: '16px',
        '& .MuiDialog-paper': { backgroundColor: '#FEF7FF' },
      }}
    >
      <DialogTitle>Filters</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={(theme) => ({
          position: 'absolute',
          right: 8,
          top: 8,
          color: theme.palette.grey[500],
        })}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* new filter frameworkFilter */}
          {frameworkFilter?.categories &&
            frameworkFilter.categories.map((categories: any) => {
              const filterCode = `se_${categories?.code}s`; // A unique identifier for the category
              const componentKey = `multi-checkbox-label_${categories?.identifier}`;

              // Transform terms into options
              const options = categories?.terms.map((term: any) => ({
                label: term.name,
                value: term.code,
              }));

              // Get the selected values for the current category
              const currentSelectedValues = selectedValues[filterCode] || [];

              return (
                <FormControl
                  fullWidth
                  key={filterCode}
                  sx={{
                    '&.Mui-focused': {
                      color: '#1D1B20', // Label color when focused
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#1D1B20', // Label color when focused
                    },
                    '& .MuiInputLabel-root': { color: '#1D1B20' }, // Label color
                    '& .MuiOutlinedInput-root': {
                      color: '#1D1B20', // Value color
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1D1B20', // Outline color
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1D1B20', // Outline color on hover
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1D1B20', // Outline color when focused
                      },
                    },
                  }}
                >
                  <InputLabel id={componentKey}>{categories?.name}</InputLabel>
                  <Select
                    labelId={componentKey}
                    input={<OutlinedInput label={categories?.name} />}
                    multiple
                    value={currentSelectedValues}
                    onChange={(event) => handleChange(event, filterCode)}
                    renderValue={(selected) =>
                      selected
                        .map((selectedValue: any) => {
                          const selectedOption = options.find(
                            (option: any) => option.value === selectedValue
                          );
                          return selectedOption ? selectedOption.label : '';
                        })
                        .join(', ')
                    }
                  >
                    {options.map((option: any) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Checkbox
                          sx={{
                            color: '#6750A4', // Default checkbox color
                            '&.Mui-checked': {
                              color: '#6750A4', // Checked checkbox color
                            },
                          }}
                          checked={currentSelectedValues.includes(option.value)}
                        />
                        <ListItemText primary={option.label} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              );
            })}
        </Box>
        <Divider sx={{ marginTop: 4 }} />
        {/* <FormControl fullWidth>
         <InputLabel id="multi-checkbox-label">Select Options</InputLabel>
         <Select
           labelId="multi-checkbox-label"
           multiple
           value={selectedOptions}
           onChange={handleChange}
           renderValue={(selected) => selected.join(', ')} // Display selected options
         >
           {options.map((option) => (
             <MenuItem key={option} value={option}>
               <Checkbox checked={selectedOptions.indexOf(option) > -1} />
               <ListItemText primary={option} />
             </MenuItem>
           ))}
         </Select>
       </FormControl> */}
        {/* Sort By */}
        {filter?.sort && (
          <>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Sort By
            </Typography>
            <FormControl>
              <RadioGroup
                value={sort?.sortBy || 'asc'}
                onChange={(e) => {
                  const value = e.target.value;
                  onSortChange?.(value);
                }}
              >
                <FormControlLabel
                  value="asc"
                  control={<Radio />}
                  label="A to Z"
                />
                <FormControlLabel
                  value="desc"
                  control={<Radio />}
                  label="Z to A"
                />
              </RadioGroup>
            </FormControl>
          </>
        )}
        {/* Language */}
        {filter?.language && filter.language.length > 0 && (
          <FormControl fullWidth margin="normal">
            <InputLabel>Language</InputLabel>
            <Select
              value={language}
              onChange={(e) => onLanguageChange?.(e.target.value)}
              label="Language"
            >
              {filter.language.map((lang) => (
                <MenuItem key={lang} value={lang}>
                  {lang}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        {/* Subject */}
        {filter?.subject && filter.subject.length > 0 && (
          <FormControl fullWidth margin="normal">
            <InputLabel>Subject</InputLabel>
            <Select
              multiple
              value={selectedSubjects || []}
              onChange={(e) => {
                const value = e.target.value as string[];
                onSubjectsChange?.(value);
              }}
              renderValue={(selected) => (selected as string[]).join(', ')} // Join array values for display
              label="Subject"
            >
              {filter.subject.map((subject) => (
                <MenuItem key={subject} value={subject}>
                  <Checkbox
                    checked={(selectedSubjects || []).indexOf(subject) > -1}
                  />
                  <ListItemText primary={subject} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        {/* Content Type */}
        {filter?.contentType && filter.contentType.length > 0 && (
          <FormControl fullWidth margin="normal">
            <InputLabel>Content Type</InputLabel>
            <Select
              multiple
              value={selectedContentTypes || []}
              onChange={(e) => {
                const value = e.target.value as string[];
                onContentTypeChange?.(value);
              }}
              renderValue={(selected) => (selected as string[]).join(', ')}
              label="Content Type"
            >
              {filter.contentType.map((type) => (
                <MenuItem key={type} value={type}>
                  <Checkbox
                    checked={(selectedContentTypes || []).indexOf(type) > -1}
                  />
                  <ListItemText primary={type} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        {/* Buttons */}
        <DialogActions sx={{ justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', mt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => {
                onApply?.({});
                setSelectedValues({});
                onClose();
              }}
              sx={{
                borderRadius: '100px',
                color: '#6750A4',
                textTransform: 'none',
              }}
            >
              Clear All
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                onApply?.(selectedValues);
                onClose();
              }}
              sx={{
                borderRadius: '100px',
                bgcolor: '#6750A4',
                color: '#FFFFFF',
                marginLeft: 2,
                textTransform: 'none',
              }}
            >
              Apply
            </Button>
          </Box>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};
export const Layout: React.FC<LayoutProps> = ({
  children,
  isFooter,
  showBack,
  backTitle,
  showLogo,
  showSearch,
  showTopAppBar,
  showFilter,
  frameworkFilter,
  topAppBarIcons = [],
  drawerItems = [],
  categorieItems = [],
  onItemClick,
  backIconClick,
  filter,
  language,
  selectedSubjects,
  selectedContentTypes,
  sort,
  onLanguageChange,
  onSubjectsChange,
  onContentTypeChange,
  onSortChange,
  onApply,
  filterValues,
  isLoadingChildren = false,
  sx = {},
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [filterShow, setFilterShow] = useState(false);
  const handleButtonClick = () => {
    console.log('Footer button clicked!');
  };
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden',
        // justifyContent: 'space-between',
        // alignItems: 'center',
        // bgcolor: 'grey',
        ...sx,
      }}
    >
      {/* <Header showLogo={showLogo} showBack={showBack} /> */}
      {showTopAppBar && (
        <Box
          sx={{
            // width: '100%',
            display: 'center',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            // padding: 2,
          }}
        >
          <Box
            sx={{
              width: '100%',
              bgcolor: '#FFFFFF',
            }}
          >
            <TopAppBar
              title="Dashboard"
              bgcolor="#FDF7FF"
              profileIcon={showTopAppBar?.profileIcon}
              actionIcons={topAppBarIcons}
              menuIconClick={() => setIsDrawerOpen(true)}
              onLogoutClick={(event) => action.onLogoutClick(event)}
              {...showTopAppBar}
              showBackIcon={showTopAppBar.showBackIcon}
              backIconClick={showTopAppBar.backIconClick}
            />
          </Box>
        </Box>
      )}

      <CommonDrawer
        open={isDrawerOpen}
        onDrawerClose={() => setIsDrawerOpen(false)}
        items={drawerItems}
        categories={categorieItems}
        onItemClick={(to) => {
          onItemClick?.(to);
          setIsDrawerOpen(false);
        }}
      />

      {showSearch && (
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '20px',
            padding: '0 16px',
          }}
        >
          <CommonSearch
            placeholder={showSearch.placeholder || ''}
            leftIcon={showSearch.leftIcon ? showSearch.leftIcon : undefined}
            rightIcon={showSearch.rightIcon ? showSearch.rightIcon : undefined}
            onLeftIconClick={
              showSearch.leftIcon ? showSearch.onLeftIconClick : undefined
            }
            onRightIconClick={
              showSearch.rightIcon ? showSearch.onRightIconClick : undefined
            }
            inputValue={showSearch.inputValue || ''}
            onInputChange={showSearch.onInputChange}
            sx={showSearch.sx || { width: 400, marginTop: '8px' }}
          />
          {showFilter && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backgroundColor: '#ECE6F0',
                borderRadius: '12px',
                // padding: '8px',
                width: '48px',
                height: '48px',
                '&:hover': {
                  backgroundColor: '#E0E0E0',
                  boxShadow: '0px 4px 8px 3px #00000026',
                },
                marginLeft: '10px',
                marginRight: '10px',
                boxShadow: '0px 1px 3px 0px #0000004D',
              }}
              onClick={() => setFilterShow(true)}
            >
              <FilterAltOutlinedIcon
                sx={{ color: '#6750A4', fontSize: '25px' }}
              />
            </Box>
          )}
        </Box>
      )}
      {/* Render Back Button Below the TopAppBar */}
      {showBack && backIconClick && (
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            padding: '8px 16px',
            bgcolor: '#FFFFFF',
            position: 'fixed', // Ensures it stays in view
            top: '55px', // Adjust based on TopAppBar's height
            zIndex: 1100, // Ensure it stays above other elements
          }}
        >
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={backIconClick}
            sx={{
              textTransform: 'none',
              color: '#1E1B16',
              fontSize: '16px',
            }}
          >
            <Typography fontSize={'22px'} fontWeight={400}>
              {backTitle}
            </Typography>
          </Button>
        </Box>
      )}

      {children}

      {isFooter && (
        <Box
          sx={{
            width: '100%',
            bgcolor: 'white',
            position: 'fixed',
            bottom: 0, // Anchors to the bottom
            left: 0,
            zIndex: 1200,
          }}
        >
          <Footer
            buttonLabel="Continue"
            // buttonWidth="328px"
            buttonHeight="40px"
            buttonBorderRadius="50px"
            buttonBackgroundColor="#FDBE16"
            buttonColor="#1E1B16"
            buttonFontSize="14px"
            buttonFontWeight={500}
            buttonSupportingText=""
            bottompx={0}
            onButtonClick={handleButtonClick}
          />
        </Box>
      )}
      {filterShow && (
        <FilterDialog
          open={filterShow}
          onClose={() => setFilterShow(false)}
          filter={filter}
          language={language ?? ''}
          selectedSubjects={selectedSubjects}
          selectedContentTypes={selectedContentTypes}
          sort={sort}
          onLanguageChange={onLanguageChange}
          onSubjectsChange={onSubjectsChange}
          onContentTypeChange={onContentTypeChange}
          onSortChange={onSortChange}
          onApply={onApply}
          frameworkFilter={frameworkFilter}
          filterValues={filterValues}
        />
      )}
    </Box>
  );
};
