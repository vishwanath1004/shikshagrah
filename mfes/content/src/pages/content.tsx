/* eslint-disable no-constant-binary-expression */
/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
'use client';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Box, Fab, Typography, Button } from '@mui/material';
import { ContentCard, CommonTabs, Layout, Circular } from '@shared-lib';
import { ContentSearch } from '../services/Search';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import Grid from '@mui/material/Grid2';
import { useRouter, useSearchParams } from 'next/navigation';
import CircleIcon from '@mui/icons-material/Circle';
import { hierarchyAPI } from '../services/Hierarchy';
import { contentReadAPI } from '../services/Read';
import { useTheme } from '@mui/material/styles';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { trackingData } from '../services/TrackingService';
import SG_LOGO from '../../public/assests/images/SG_Logo.png';

interface ContentItem {
  name: string;
  gradeLevel: string[];
  language: string[];
  artifactUrl: string;
  identifier: string;
  appIcon: string;
  contentType: string;
  mimeType: string;
  description: string;
  posterImage: string;
  children: [{}];
}

export default function Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const identifier = searchParams.get('identifier');
  const [searchValue, setSearchValue] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [contentData, setContentData] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [limit, setLimit] = useState(12); // Increased initial limit
  const [offset, setOffset] = useState(0);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [filterValues, setFilterValues] = useState({});
  const theme = useTheme();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [frameworkFilter, setFrameworkFilter] = useState(false);
  const [trackData, setTrackData] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [issueData, setIssueData] = useState({
    subject: '',
    description: '',
    status: '',
    priority: '',
  });
  const observer = useRef<IntersectionObserver>();
  const loadingRef = useRef<HTMLDivElement>(null);

  const getCookie = (name: any) => {
    const cookies = document.cookie.split('; ');
    const cookie = cookies.find((row) => row.startsWith(name + '='));
    const value = cookie ? cookie.split('=')[1] : null;
    return value && value !== 'null' && value !== 'undefined' ? value : null;
  };

  useEffect(() => {
    const token = getCookie('accToken');
    const userId = getCookie('userId');
    if (token !== null) {
      localStorage.setItem('accToken', token);
    }

    if (userId !== null) {
      localStorage.setItem('userId', userId);
    }
  }, []);

  const fetchContent = useCallback(
    async (
      type?: string,
      searchValue?: string,
      filterValues?: {},
      limit?: number,
      offset?: number
    ) => {
      setIsLoading(true);
      try {
        let result;
        if (identifier) {
          result = await hierarchyAPI(identifier);
          setContentData([result]);
        } else {
          result =
            type &&
            (await ContentSearch(
              type,
              searchValue,
              filterValues,
              limit,
              offset
            ));

          if (!result || result === undefined || result?.length === 0) {
            setHasMoreData(false);
          } else {
            setContentData((prevData) => [...prevData, ...result]);
            fetchDataTrack(result);
            setHasMoreData(true);
          }
        }
      } catch (error) {
        console.error('Failed to fetch content:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [identifier]
  );

  const fetchDataTrack = async (resultData: any) => {
    if (!resultData.length) return;
    try {
      const courseList = resultData.map((item: any) => item.identifier);
      const userId = localStorage.getItem('userId');
      const userIdArray = userId?.split(',');
      if (!userId || !courseList.length) return;

      const course_track_data = await trackingData(userIdArray, courseList);

      if (course_track_data?.data) {
        const userTrackData =
          course_track_data.data.find((course: any) => course.userId === userId)
            ?.course ?? [];
        setTrackData(userTrackData);
      }
    } catch (error) {
      console.error('Error fetching track data:', error);
    }
  };

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (!hasMoreData || isLoading) return;

    const observerOptions = {
      root: null,
      rootMargin: '20px',
      threshold: 0.1,
    };

    const handleObserver = (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting) {
        const newOffset = offset + limit;
        setOffset(newOffset);
        const type = tabValue === 0 ? 'Course' : 'Learning Resource';
        fetchContent(type, searchValue, filterValues, limit, newOffset);
      }
    };

    observer.current = new IntersectionObserver(
      handleObserver,
      observerOptions
    );
    if (loadingRef.current) {
      observer.current.observe(loadingRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [
    hasMoreData,
    isLoading,
    offset,
    limit,
    tabValue,
    searchValue,
    filterValues,
    fetchContent,
  ]);

  useEffect(() => {
    const type = tabValue === 0 ? 'Course' : 'Learning Resource';
    const cookies = document.cookie.split('; ');
    const subid = cookies
      .find((row) => row.startsWith('subid='))
      ?.split('=')[1];
    localStorage.setItem('subId', subid);

    // Reset content and offset when tab or filters change
    setContentData([]);
    setOffset(0);
    setHasMoreData(true);
    fetchContent(type, searchValue, filterValues, limit, 0);
  }, [tabValue, filterValues]);

  const handleSearchClick = async () => {
    const type = tabValue === 0 ? 'Course' : 'Learning Resource';
    setContentData([]);
    setOffset(0);
    if (searchValue.trim()) {
      let result = await ContentSearch(
        type,
        searchValue,
        filterValues,
        limit,
        0
      );

      setContentData(result || []);
      setOffset(0);
      setHasMoreData(result?.length === limit);
    } else {
      setSearchValue('');
      setContentData([]);
      setOffset(0);
      const type = tabValue === 0 ? 'Course' : 'Learning Resource';
      fetchContent(type, '', filterValues, limit, 0);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchValue(value);

    // If input is cleared, trigger search immediately
    if (!value.trim()) {
      handleSearchClick();
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setContentData([]);
    setOffset(0);
  };

  const handleCardClick = async (
    identifier: string,
    contentMimeType: string
  ) => {
    setIsLoading(true);
    try {
      if (
        [
          'application/vnd.ekstep.ecml-archive',
          'application/vnd.ekstep.html-archive',
          'application/vnd.ekstep.h5p-archive',
          'application/pdf',
          'video/mp4',
          'video/webm',
          'application/epub',
          'video/x-youtube',
          'application/vnd.sunbird.questionset',
        ].includes(contentMimeType)
      ) {
        await contentReadAPI(identifier);
        router.push(`/player/${identifier}`);
      } else {
        const result = await hierarchyAPI(identifier);
        setSelectedContent(result);
        router.push(`/content-details/${identifier}`);
      }
    } catch (error) {
      console.error('Failed to fetch content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderTabContent = () => (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2}>
        {contentData?.map((item) => (
          <Grid key={item?.identifier} size={{ xs: 6, sm: 6, md: 2, lg: 2 }}>
            <ContentCard
              title={item?.name.trim()}
              image={item?.posterImage ? item?.posterImage : SG_LOGO.src}
              content={item?.description || '-'}
              actions={item?.contentType}
              orientation="vertical"
              item={[item]}
              TrackData={trackData}
              type={tabValue === 0 ? 'Course' : 'Learning Resource'}
              onClick={() => handleCardClick(item?.identifier, item?.mimeType)}
            />
          </Grid>
        ))}
      </Grid>

      {/* Loading indicator for infinite scroll */}
      <Box ref={loadingRef} sx={{ textAlign: 'center', py: 4 }}>
        {isLoading && <Circular />}
        {!isLoading && !hasMoreData && contentData.length > 0 && (
          <Typography variant="body1" color="textSecondary">
            No more content available
          </Typography>
        )}
        {!isLoading && contentData.length === 0 && (
          <Typography variant="body1" color="textSecondary">
            No content found
          </Typography>
        )}
      </Box>
    </Box>
  );

  const tabs = [
    { label: 'Courses', content: renderTabContent() },
    { label: 'Resource', content: renderTabContent() },
  ];

  const handleItemClick = (to: string) => {
    router.push(to);
  };

  const drawerItems = [
    { text: 'Home', icon: <CircleIcon fontSize="small" />, to: '/' },
    { text: 'Content', icon: <CircleIcon fontSize="small" />, to: '/content' },
  ];

  const handleApplyFilters = async (selectedValues: any) => {
    setContentData([]);
    setOffset(0);
    const type = tabValue === 0 ? 'Course' : 'Learning Resource';
    let result = await ContentSearch(
      type,
      searchValue,
      selectedValues,
      limit,
      0
    );
    setContentData(result || []);
    setHasMoreData(result?.length === limit);
  };

  useEffect(() => {
    fetchFramework();
  }, [router]);

  const fetchFramework = async () => {
    try {
      const url = `${process.env.NEXT_PUBLIC_SSUNBIRD_BASE_URL}/api/framework/v1/read/atree-framework`;
      const frameworkData = await fetch(url).then((res) => res.json());
      const frameworks = frameworkData?.result?.framework;
      setFrameworkFilter(frameworks);
    } catch (error) {
      console.error('Error fetching board data:', error);
    }
  };

  return (
    <Layout
      showTopAppBar={{
        title: 'Content',
        showMenuIcon: true,
      }}
      isFooter={true}
      showLogo={true}
      showSearch={{
        placeholder: 'Search content..',
        rightIcon: <SearchIcon />,
        inputValue: searchValue,
        onInputChange: handleSearchChange,
        onRightIconClick: handleSearchClick,
        sx: {
          backgroundColor: '#f0f0f0',
          padding: '4px',
          borderRadius: '50px',
          width: '100%',
        },
      }}
      onItemClick={handleItemClick}
      onApply={handleApplyFilters}
    >
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          bgcolor: theme.palette.background.default,
          flexDirection: 'column',
          marginTop: '20px',
          paddingBottom: '80px',
          overflowX: 'hidden',
        }}
      >
        <CommonTabs
          tabs={tabs}
          value={tabValue}
          onChange={handleTabChange}
          ariaLabel="Custom icon label tabs"
        />
      </Box>

      {showBackToTop && (
        <Fab
          color="secondary"
          aria-label="back to top"
          sx={{
            position: 'fixed',
            display: 'table-column',
            bottom: 80,
            right: 16,
            height: '75px',
            borderRadius: '100px',
            bgcolor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            '&:hover': {
              bgcolor: theme.palette.primary.dark,
            },
          }}
          onClick={handleBackToTop}
        >
          <ArrowUpwardIcon />
          <Typography fontSize={'10px'}>Back to Top</Typography>
        </Fab>
      )}
    </Layout>
  );
}
