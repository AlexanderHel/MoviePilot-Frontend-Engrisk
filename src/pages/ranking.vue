<script setup lang="ts">
import MediaCardSlideView from '@/views/discover/MediaCardSlideView.vue'
</script>

<template>
  <div>
    <MediaCardSlideView
      apipath="tmdb/trending"
      linkurl="/browse/tmdb/trending?title= Fashionable trend"
      title=" Fashionable trend"
    />

    <MediaCardSlideView
      apipath="douban/showing"
      linkurl="/browse/douban/showing?title= Currently in theaters"
      title=" Currently in theaters"
    />

    <MediaCardSlideView
      apipath="tmdb/movies"
      linkurl="/browse/tmdb/movies?title= Hot movies"
      title=" Hot movies"
    />

    <MediaCardSlideView
      apipath="tmdb/tvs?with_original_language=zh|en|ja|ko"
      linkurl="/browse/tmdb/tvs??with_original_language=zh|en|ja|ko&title= Popular tv series"
      title=" Popular tv series"
    />

    <MediaCardSlideView
      apipath="douban/movies"
      linkurl="/browse/douban/movies?title= Latest movies"
      title=" Latest movies"
    />

    <MediaCardSlideView
      apipath="douban/tvs"
      linkurl="/browse/douban/tvs?title= Latest tv series"
      title=" Latest tv series"
    />

    <MediaCardSlideView
      apipath="douban/movie_top250"
      linkurl="/browse/douban/movie_top250?title= CinematicTOP250"
      title=" CinematicTOP250"
    />

    <MediaCardSlideView
      apipath="douban/tv_weekly_chinese"
      linkurl="/browse/douban/tv_weekly_chinese?title= Domestic drama series list"
      title=" Domestic drama series list"
    />

    <MediaCardSlideView
      apipath="douban/tv_weekly_global"
      linkurl="/browse/douban/tv_weekly_global?title= Global drama series list"
      title=" Global drama series list"
    />
  </div>
</template>
