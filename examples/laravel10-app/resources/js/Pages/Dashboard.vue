<script setup lang="ts">
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, Link } from '@inertiajs/vue3';
// import { Paginate } from '@7nohe/laravel-typegen';
import { User } from '@/types/model';

defineProps<{ users: any }>();

</script>

<template>

    <Head title="Dashboard" />

    <AuthenticatedLayout>
        <template #header>
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>
        </template>

        <div class="py-12">
            <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-12">
                    <ul>
                        <li v-for="user in users.data">- {{ user.name }}({{ user.email }})</li>
                    </ul>
                    <div class="flex justify-center mt-4 space-x-4">
                        <Link v-for="(link, key) in users.links" :key="key"
                            class="px-4 py-3 text-sm leading-4 bg-white rounded hover:bg-white focus:text-indigo-500 hover:shadow"
                            :class="{ 'bg-indigo-400 text-white': link.active }" :href="link.url ?? '#'" v-html="link.label" />
                    </div>
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>
