<script setup lang="ts">
import type { Person } from './credits'
defineProps<{ members: Person[]; featured?: boolean }>()
</script>

<template>
  <ul class="member-list" :class="{ 'featured-member': featured }">
    <li v-for="member in members" :key="`${member.name}\u0000${member.alias || ''}`">
      <span class="member-name">{{ member.name }}</span>
    </li>
  </ul>
</template>
